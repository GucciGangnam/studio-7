// Single source of truth for per-route SEO.
// Consumed by scripts/prerender.mjs at build time to emit real static HTML
// (head tags + crawlable body content + JSON-LD) for each public route.
//
// Keep copy truthful — this is exactly what Google and AI assistants ingest.

export const SITE = 'https://studio7.software'
export const NAME = 'Studio 7'
export const TAGLINE = 'Design · Develop · Deploy'

const og = (file) => `${SITE}/og/${file}`

// --- Reusable structured-data nodes -----------------------------------------

const ORGANIZATION = {
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE}/#organization`,
  name: NAME,
  url: `${SITE}/`,
  description:
    'A digital product studio that designs, develops, and deploys distinctive web and mobile products — from concept to production.',
  slogan: 'Design, develop, and deploy.',
  logo: {
    '@type': 'ImageObject',
    url: `${SITE}/android-chrome-512x512.png`,
    width: 512,
    height: 512,
  },
  image: og('og-default.png'),
  knowsAbout: [
    'Web development',
    'Mobile app development',
    'Product design',
    'UI/UX design',
    'Full-stack engineering',
    'MVP development',
    'Progressive Web Apps',
    'API design',
    'Payment integration',
  ],
  areaServed: 'Worldwide',
  serviceType: [
    'Product design',
    'Web development',
    'Application development',
    'Deployment & infrastructure',
  ],
}

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: NAME,
  publisher: { '@id': `${SITE}/#organization` },
  inLanguage: 'en',
}

// Wrap page-specific nodes with the shared Organization + WebSite graph.
const graph = (...nodes) => ({
  '@context': 'https://schema.org',
  '@graph': [ORGANIZATION, WEBSITE, ...nodes],
})

const webPage = (path, name, description) => ({
  '@type': 'WebPage',
  '@id': `${SITE}${path}#webpage`,
  url: `${SITE}${path}`,
  name,
  description,
  isPartOf: { '@id': `${SITE}/#website` },
  about: { '@id': `${SITE}/#organization` },
  inLanguage: 'en',
})

// ---------------------------------------------------------------------------

export const ROUTES = [
  {
    path: '/',
    title: 'Studio 7 — Design, Develop & Deploy Digital Products',
    description:
      'Studio 7 is a digital product studio. We design, develop, and deploy distinctive web and mobile products — from concept to production. Front end, back end, and everything in between.',
    ogImage: og('og-default.png'),
    ogAlt: 'Studio 7 — Design · Develop · Deploy',
    eyebrow: 'Digital product studio',
    h1: 'We design, develop & deploy digital products.',
    intro:
      'Studio 7 is a digital product studio. We take products from concept to production — design, front-end, back-end, and deployment — building distinctive web and mobile experiences that ship.',
    bullets: [
      'End-to-end delivery: design, development, and deployment under one roof.',
      'Web apps, mobile apps, PWAs, APIs, and payment integrations.',
      'From a fresh concept to a complete product — or elevating what you already have.',
    ],
    jsonLd: graph(
      webPage('/', 'Studio 7 — Digital Product Studio', 'Design, develop, and deploy digital products.'),
    ),
  },
  {
    path: '/services',
    title: 'Services — What We Build | Studio 7',
    description:
      'From a concept to a complete product, or elevating what you already have — Studio 7 crafts digital products with precision and care. Design, development, and deployment services.',
    ogImage: og('og-services.png'),
    ogAlt: 'Studio 7 Services — What we build',
    eyebrow: 'Services',
    h1: 'What we build',
    intro:
      'From a concept to a complete product, or elevating what you already have — we craft digital products with precision and care.',
    bullets: [
      'Product & UI/UX design — interfaces designed to be used, not just admired.',
      'Front-end development — fast, accessible, distinctive web and app experiences.',
      'Back-end & APIs — the systems, data, and integrations behind the product.',
      'Deployment & infrastructure — shipped, hosted, and built to scale.',
    ],
    jsonLd: graph(
      webPage('/services', 'Services — Studio 7', 'What Studio 7 builds: design, development, and deployment.'),
      {
        '@type': 'Service',
        name: 'Digital product design & development',
        provider: { '@id': `${SITE}/#organization` },
        serviceType: 'Product design, web & app development, deployment',
        areaServed: 'Worldwide',
        description:
          'End-to-end digital product delivery — design, front-end, back-end, and deployment.',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Studio 7 services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Product & UI/UX design' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Front-end development' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Back-end & API development' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Deployment & infrastructure' } },
          ],
        },
      },
    ),
  },
  {
    path: '/work',
    title: 'Work — Selected Projects | Studio 7',
    description:
      'A look at what Studio 7 builds: web and mobile products, real-time systems, APIs, and payment platforms — designed, developed, and deployed end to end.',
    ogImage: og('og-work.png'),
    ogAlt: 'Studio 7 Work — Selected projects',
    eyebrow: 'Work',
    h1: 'See what we build',
    intro:
      'A closer look at the products we design and engineer — from front-end interfaces to the real-time back-ends, APIs, and payment systems that power them.',
    bullets: [
      'Full front-end interfaces for web and mobile.',
      'Real-time back-ends, REST APIs, and job queues built to scale.',
      'Payment integrations and production-grade infrastructure.',
    ],
    jsonLd: graph(
      webPage('/work', 'Work — Studio 7', 'Selected projects designed, developed, and deployed by Studio 7.'),
    ),
  },
  {
    path: '/clients',
    title: 'Clients — Who We Work With | Studio 7',
    description:
      'Studio 7 partners with teams across aviation, health & safety, biotech, and advertising — shipping MVPs and scaling live products. See our client case studies.',
    ogImage: og('og-clients.png'),
    ogAlt: 'Studio 7 Clients — Case studies',
    eyebrow: 'Clients',
    h1: 'Who we work with',
    intro:
      'We partner with teams across aviation, health & safety, biotech, and advertising — from shipping a first MVP to scaling live, high-throughput products.',
    bullets: [
      'Aviation — shipped a full catering-platform MVP (front end, back end, Stripe payments, PWA) in twelve weeks; now a network of 500+ caterers.',
      'Biotech — live telemetry built to scale: readings every 5 seconds per tank, 100k+ readings a minute by design.',
      'Also serving Health & Safety and Advertising.',
    ],
    jsonLd: graph(
      webPage('/clients', 'Clients — Studio 7', 'The teams and industries Studio 7 works with.'),
    ),
  },
  {
    path: '/contact',
    title: 'Contact — Start a Project | Studio 7',
    description:
      'Have a product to build? Get in touch with Studio 7. Tell us about your project and we’ll help you design, develop, and deploy it.',
    ogImage: og('og-contact.png'),
    ogAlt: 'Contact Studio 7 — Start a project',
    eyebrow: 'Contact',
    h1: 'Start a project',
    intro:
      'Have a product to build, or one that needs taking further? Tell us about it — we’ll help you design, develop, and deploy it.',
    bullets: [
      'Tell us about your project and timeline.',
      'We reply to every genuine enquiry.',
      'Design · Develop · Deploy.',
    ],
    jsonLd: graph(
      { ...webPage('/contact', 'Contact — Studio 7', 'Get in touch with Studio 7 to start a project.'), '@type': 'ContactPage' },
    ),
  },
]
