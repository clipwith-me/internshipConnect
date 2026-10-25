import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Students',
    links: [
      { label: 'Browse internships', to: '/internships' },
      { label: 'Create a free profile', to: '/auth/register' },
      { label: 'Career tips', to: '/career-tips' },
    ],
  },
  {
    title: 'Employers',
    links: [
      { label: 'Post an internship', to: '/auth/register?role=organization' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Contact sales', to: '/contact-sales' },
    ],
  },
  {
    title: 'Universities',
    links: [{ label: 'Register your institution', to: '/auth/register?role=university' }],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of service', to: '/terms' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <img src="/logo-darkmode.png" alt="InternshipConnect" width="1028" height="265" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Helping students find their first internship, and employers find motivated early-career talent.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold text-white">{col.title}</h2>
              <ul className="mt-4 space-y-3">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="rounded text-sm text-neutral-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-neutral-800 pt-6 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
          <p>Built in Nigeria for early-career talent.</p>
        </div>
      </div>
    </footer>
  );
}
