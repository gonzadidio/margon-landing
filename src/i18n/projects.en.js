/**
 * English copy for the projects defined in ../projectsData.js.
 *
 * Spanish stays the source of truth in projectsData.js (it also carries the
 * non-translatable parts: slug, image, tags, type, logo). This file only
 * overrides the copy, keyed by slug: `title` is a brand name so it never
 * changes, and any field left out simply falls back to Spanish.
 */

export const projectsEn = {
  orbex: {
    category: 'Real Estate Development',
    description: 'A purpose-built sales system for a land developer: every opportunity tracked from first contact to closed deal.',
    lede: 'A purpose-built sales system to manage every opportunity from first contact to closed deal.',
    duration: 'Purpose-built system in production, under continuous development.',
    results: 'The entire sales process on a single platform.',
    cases: [],
  },

  'punto-bella-vista': {
    category: 'Car Dealership',
    description: 'Web platform for a multi-brand dealership with a vehicle catalogue, online booking and an admin panel.',
    lede: 'Web platform and management panel for a dealership: vehicle catalogue, online bookings and centralised administration, all in one place.',
    duration: '8 weeks — from design to production deploy.',
    results: '+40% online enquiries and centralised stock management.',
    cases: [
      { title: 'Catalogue with smart search', text: 'Customers filter by make, model, year and price in seconds. Every unit has its own page with a gallery, specs and direct contact over WhatsApp.' },
      { title: 'Online bookings, no phone calls', text: 'Test drive and service bookings synced with the dealership calendar. Less back and forth on the phone, more confirmed appointments.' },
      { title: 'Admin panel', text: 'Adding and editing vehicles, managing bookings and enquiry metrics in a simple panel the team runs without depending on anyone.' },
    ],
  },

  comextracker: {
    category: 'International Trade',
    description: 'Tracking for international trade operations: shipments, paperwork and the status of every operation in a single panel.',
    lede: 'End-to-end tracking for international trade operations: shipments, paperwork and the status of every operation in a single panel.',
    duration: '',
    results: '',
    cases: [],
  },

  handprox: {
    category: 'Sports SaaS',
    description: 'A SaaS platform for handball management and analysis with live stats, team and league management.',
    lede: 'A SaaS built for handball: live stats plus team, player and league management on a single platform.',
    duration: '12 weeks of continuous development.',
    results: 'Real-time stats adopted by multiple teams.',
    cases: [
      { title: 'Live stats', text: 'Events logged game by game with real-time updates over websockets. Rankings and metrics that calculate themselves.' },
      { title: 'Team and league management', text: 'Player sign-ups, squads, fixtures and standings. The whole tournament run from one place.' },
    ],
  },

  'fleur-co': {
    category: 'E-Commerce',
    description: 'Premium artificial flower e-commerce with cart, checkout, MercadoPago integration and an admin panel.',
    lede: 'A premium online store for artificial flowers: a carefully built catalogue, cart, MercadoPago checkout and an admin panel.',
    duration: '6 weeks.',
    results: 'Online sales running end to end.',
    cases: [
      { title: 'Frictionless checkout', text: 'Catalogue with variants, a persistent cart and MercadoPago checkout built in so people pay in seconds.' },
      { title: 'Management panel', text: 'Adding products, stock control and order tracking from a panel designed for non-technical users.' },
    ],
  },

  celebria: {
    category: 'Digital Invitations',
    description: 'Interactive digital invitation platform with premium templates, a real-time editor and RSVP management.',
    lede: 'Interactive digital invitations: premium templates, a real-time editor and RSVP management for every event.',
    duration: '10 weeks.',
    results: 'Invitations created and sent by the users themselves.',
    cases: [
      { title: 'Real-time editor', text: 'Users customise their invitation and see the changes instantly, without knowing anything about design.' },
      { title: 'RSVP and guest management', text: 'Online confirmations, guest lists and reminders, all centralised for the organiser.' },
    ],
  },

  'bar-app': {
    category: 'Hospitality',
    description: 'Mobile app for a bar with a digital wallet, VIP tiers, table ordering and QR bookings.',
    lede: "A bar's mobile app: digital wallet, VIP perks, table ordering and QR bookings to keep customers coming back.",
    duration: '14 weeks (app + backend).',
    results: 'Higher repeat visits and average ticket with the VIP programme.',
    cases: [
      { title: 'Ordering from the table', text: 'The customer scans a QR code, orders and pays from their phone. Shorter queues, faster turnover.' },
      { title: 'Wallet and VIP perks', text: 'Digital balance, tiers and rewards that give people a reason to come back. Gamification applied to the business.' },
    ],
  },

  'bar-admin': {
    category: 'Hospitality',
    description: 'Admin panel with real-time metrics plus order, booking, event and gamification management.',
    lede: "The bar's control panel: live metrics, order and booking management, events and the gamification engine behind the app.",
    duration: 'Built alongside the app.',
    results: "The venue's operation centralised in a single panel.",
    cases: [
      { title: 'Real-time metrics', text: "The day's sales, tables and bookings live, so decisions happen on the spot." },
      { title: 'End-to-end management', text: 'Orders, bookings, events and rewards all administered from the same place.' },
    ],
  },

  pintureria: {
    category: 'E-Commerce',
    description: 'Paint e-commerce with an AI assistant that calculates materials, a 500+ product catalogue and a store locator.',
    lede: 'A paint e-commerce with an AI assistant that works out how much paint you need, a 500+ product catalogue and a store locator.',
    duration: '9 weeks.',
    results: 'Fewer repetitive enquiries thanks to the AI assistant.',
    cases: [
      { title: 'AI assistant', text: 'The customer enters the area and surface type and the AI tells them how much paint to buy. Fewer mistakes, more sales.' },
      { title: 'A large, searchable catalogue', text: 'More than 500 products organised and filterable, with a store locator by proximity.' },
    ],
  },

  padelleague: {
    category: 'Sports SaaS',
    description: 'SaaS platform for padel tournaments with automatic fixtures, real-time rankings and payment management.',
    lede: 'A SaaS for running padel tournaments: automatic fixtures, real-time rankings and entry fees collected through Stripe.',
    duration: '11 weeks.',
    results: 'Tournaments run start to finish without spreadsheets.',
    cases: [
      { title: 'Automatic fixtures', text: 'Match-ups and the calendar build themselves from the registered players. Zero manual setup.' },
      { title: 'Rankings and payments', text: 'Live rankings and online entry fees through Stripe, fully integrated.' },
    ],
  },

  aguilasoft: {
    // Los tags de este caso son descriptivos, no nombres de tecnología.
    tags: ['Web portal', 'WhatsApp API', 'Multi-company', 'AI'],
    category: 'B2B portal for wholesalers',
    description: "A self-service portal for a wholesaler's customers: account balance, a catalogue with their own pricing, orders and tracking, on the web and over WhatsApp.",
    lede: 'The phone stops ringing. A wholesaler serves hundreds of shops and the same four calls come in all day long: what do I owe, send me the price list, do you have stock, where is my order. The portal is the door for customers to walk in on their own, at any hour, and see their data without anyone looking it up for them.',
    duration: 'In production, with several wholesalers live.',
    results: 'Four fewer calls a day: balance, pricing, stock and orders available on a Sunday night.',
    cases: [
      { title: 'Their price, not a generic list', text: 'Every customer sees what they pay: their list, their discount and their agreed prices, already applied. They search by code, name or description — and depending on the company, by manufacturer code or equivalence too — with photos and filters each wholesaler defines.' },
      { title: 'A clear current account', text: 'How much they owe, what is overdue and what is coming due, broken down by age rather than a single lump figure. They filter by date and document type, open an invoice down to its line items, and export the summary to Excel or PDF.' },
      { title: 'Orders end to end', text: 'They build the order from the catalogue or by pasting a list of codes, pick a delivery date and branch, and send it. Then they follow which stage each one is in — sent, accepted, being picked, invoiced — with progress by units and a button to repeat a previous order in full.' },
      { title: 'One WhatsApp bot per company', text: "Everything the portal does, on the channel people already use, from each wholesaler's own number. It answers balance, pricing, stock and order status; it never makes up a figure — the data comes straight from the system, live. When the customer asks for a person, it goes quiet and the conversation shows up unread in the supplier's panel." },
      { title: "The supplier's panel", text: "The company runs its own portal without asking anyone: it defines what each customer sees, its logo and colour, the vocabulary of its trade, and uploads product photos in batches. Supplier invoices are read straight off the PDF and reviewed before they enter the system." },
      { title: 'It reads live, it does not copy data', text: "The portal reads the management system's database in the moment: no nightly sync, no yesterday's data. And it writes in exactly one place — the order inbox; it does not issue documents, post to the current account or move stock. The customer's database is left untouched." },
      { title: 'One system, many portals', text: "Each company comes in through its own subdomain and sees its own portal, with its brand and its rules. It is the same system: whatever gets fixed or improved shows up in all of them at once. To the end customer, it is their supplier's portal." },
    ],
  },

  gestio: {
    category: 'Management System',
    description: 'A management panel for a business: orders, customers, goods, suppliers, expenses and sales tracking in a single view.',
    lede: 'The whole business in a single view: orders, customers, goods, suppliers, expenses and sales tracking in one panel.',
    duration: '',
    results: '',
    cases: [],
  },
}
