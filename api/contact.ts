import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

// Serverless (Node.js) handler for the contact form.
//
// Flow, in priority order:
//   1. Email the submission to the studio inbox via Gmail (nodemailer).
//   2. Best-effort: also store the row in Supabase as a backup/record.
//
// Email comes first on purpose — if Supabase is paused, the message still
// reaches the inbox instead of being lost.
//
// Required env vars (set these in the Vercel project, not in code):
//   GMAIL_USER                 the Gmail address that sends (the authenticated account)
//   GMAIL_APP_PASSWORD         a Google App Password (needs 2-Step Verification on)
//   CONTACT_TO                 where submissions are forwarded
//   SUPABASE_URL               (optional) Supabase project URL, enables rate limit + backup
//   SUPABASE_ANON_KEY          (optional) used to call the rate-limit function
//   SUPABASE_SERVICE_ROLE_KEY  (optional) SECRET — enables the backup insert into `contacts`.
//                              The table is locked down (RLS deny-all, no anon grants), so
//                              only this server-side key can persist a row. Never expose it
//                              to the client. Without it, the backup insert is skipped.

// Mirror the DB check constraints so we reject junk before doing any work.
const LIMITS = { name: 200, email: 320, message: 5000 } as const

// Rate limit: at most RATE_MAX submissions per IP per RATE_WINDOW_SECONDS.
// Tune freely — 5/hour is generous for a real visitor, punishing for a script.
const RATE_MAX = 5
const RATE_WINDOW_SECONDS = 60 * 60

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

// Best-effort client IP behind Vercel's proxy. x-forwarded-for is a comma list
// with the real client first; x-real-ip is a fallback.
function clientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for']
  const first = Array.isArray(xff) ? xff[0] : xff?.split(',')[0]
  return (first || (req.headers['x-real-ip'] as string) || 'unknown').trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body ?? {}
  const name = clean(body.name, LIMITS.name)
  const email = clean(body.email, LIMITS.email)
  const message = clean(body.message, LIMITS.message)

  // ── Honeypot (free, no infra) ──
  // `company` is a hidden field no human ever sees or fills. If it has a value,
  // a bot filled it. Pretend success so the bot doesn't learn it was caught, and
  // never send the email or touch the DB.
  if (clean(body.company, 200)) {
    return res.status(200).json({ ok: true })
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email, or message.' })
  }

  // ── Rate limit (atomic, before any email is sent) ──
  // A single SECURITY DEFINER function does check-and-increment under a row lock,
  // so a concurrent burst can't slip past. Fail OPEN: if Supabase is unreachable
  // we log and let the message through rather than break a genuine inquiry.
  const rlUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const rlKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (rlUrl && rlKey) {
    try {
      const supabase = createClient(rlUrl, rlKey)
      const { data, error } = await supabase.rpc('rl_hit', {
        p_key: `contact:${clientIp(req)}`,
        p_limit: RATE_MAX,
        p_window_seconds: RATE_WINDOW_SECONDS,
      })
      const hit = Array.isArray(data) ? data[0] : data
      if (error) {
        console.error('Rate-limit check failed (allowing through):', error.message)
      } else if (hit && hit.allowed === false) {
        if (hit.retry_after) res.setHeader('Retry-After', String(hit.retry_after))
        return res.status(429).json({ error: 'Too many requests. Please try again later.' })
      }
    } catch (err) {
      console.error('Rate-limit check threw (allowing through):', err)
    }
  }

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  const to = process.env.CONTACT_TO || user
  if (!user || !pass) {
    console.error('Mail not configured: GMAIL_USER / GMAIL_APP_PASSWORD missing.')
    return res.status(500).json({ error: 'Mail service not configured.' })
  }

  // ── 1. Send the email (the part that must not fail silently) ──
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
    await transporter.sendMail({
      from: `"Studio 7 Contact Form" <${user}>`,
      to,
      replyTo: email, // reply goes straight to the person who submitted
      subject: `New contact form submission — ${name}`,
      text:
        `New message from the Studio 7 contact form\n\n` +
        `Name:    ${name}\n` +
        `Contact: ${email}\n` +
        `Time:    ${new Date().toISOString()}\n\n` +
        `Message:\n${message}\n`,
      html:
        `<h2 style="margin:0 0 12px">New contact form submission</h2>` +
        `<p style="margin:0"><strong>Name:</strong> ${escapeHtml(name)}</p>` +
        `<p style="margin:0"><strong>Contact:</strong> ${escapeHtml(email)}</p>` +
        `<p style="margin:0"><strong>Time:</strong> ${new Date().toISOString()}</p>` +
        `<hr style="margin:16px 0;border:none;border-top:1px solid #ddd">` +
        `<p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>`,
    })
  } catch (err) {
    console.error('Email send failed:', err)
    return res.status(502).json({ error: 'Could not send email.' })
  }

  // ── 2. Best-effort backup into Supabase (never blocks the response) ──
  // The `contacts` table is locked down (RLS deny-all, no anon grants) so writes
  // can only happen with the SERVICE-ROLE key, server-side. This keeps every write
  // behind the honeypot + rate limit above — there's no direct-insert path for the
  // public anon key to abuse. If the service-role key isn't set, we simply skip the
  // backup; the email has already been delivered, so nothing is lost.
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supaUrl && supaServiceKey) {
    try {
      const supabase = createClient(supaUrl, supaServiceKey, {
        auth: { persistSession: false },
      })
      const { error } = await supabase.from('contacts').insert({ name, email, message })
      if (error) console.error('Supabase backup insert failed:', error.message)
    } catch (err) {
      console.error('Supabase backup insert threw:', err)
    }
  }

  return res.status(200).json({ ok: true })
}

function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
