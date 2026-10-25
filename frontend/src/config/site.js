// frontend/src/config/site.js
// One place for public-facing identity and contact details.
//
// CONTACT_EMAIL defaults to the mailbox the platform already sends every email
// from (so it is known to exist). Once branded mailboxes such as
// hello@/support@/privacy@ are set up on your own domain, set
// VITE_CONTACT_EMAIL (and optionally the others) in the Vercel environment and
// every page updates without a code change.

export const SITE = {
  name: 'InternshipConnect',
  url: 'https://internship-connect-beta.vercel.app',
};

const fallback = 'internshipconnects@gmail.com';

export const CONTACT = {
  general: import.meta.env.VITE_CONTACT_EMAIL || fallback,
  support: import.meta.env.VITE_SUPPORT_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || fallback,
  privacy: import.meta.env.VITE_PRIVACY_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || fallback,
  legal: import.meta.env.VITE_LEGAL_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || fallback,
  sales: import.meta.env.VITE_SALES_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || fallback,
};
