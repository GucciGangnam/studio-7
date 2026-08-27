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
//   GMAIL_USER            the Gmail address that sends (the authenticated account)
//   GMAIL_APP_PASSWORD    a Google App Password (needs 2-Step Verification on)
//   CONTACT_TO            where submissions are forwarded
//   SUPABASE_URL          (optional) enables the backup insert
//   SUPABASE_ANON_KEY     (optional) enables the backup insert

// Mirror the DB check constraints so we reject junk before doing any work.
const LIMITS = { name: 200, email: 320, message: 5000 } as const

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
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

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing name, email, or message.' })
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
  const supaUrl = process.env.SUPABASE_URL
  const supaKey = process.env.SUPABASE_ANON_KEY
  if (supaUrl && supaKey) {
    try {
      const supabase = createClient(supaUrl, supaKey)
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
