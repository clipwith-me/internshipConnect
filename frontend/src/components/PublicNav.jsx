import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = {
  navy: '#0D1426', amber: '#E8A230', white: '#ffffff',
  gray200: '#E5E7EB', gray600: '#4B5563',
};

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Career Tips', href: '/career-tips' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

export default function PublicNav() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav style={{
      background: C.navy,
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img
          src="/logo-primary.png"
          alt="InternshipConnect"
          style={{ height: 36, objectFit: 'contain' }}
          onError={e => { e.target.src = '/logo-icon.png'; }}
        />
      </a>

      {/* Nav links — hidden on mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="pub-nav-links">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={e => { e.preventDefault(); navigate(href); }}
            style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: C.amber, color: C.navy, fontWeight: 700, fontSize: 14, padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth/login')}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/auth/register')}
                style={{ background: C.amber, color: C.navy, fontWeight: 700, fontSize: 14, padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .pub-nav-links { display: none !important; } }
      `}</style>
    </nav>
  );
}
