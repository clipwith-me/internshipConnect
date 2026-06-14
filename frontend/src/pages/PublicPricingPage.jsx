import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useAuth } from '../context/AuthContext';

const C = {
  navy: '#0D1426', amber: '#E8A230',
  white: '#ffffff', gray50: '#F9FAFB',
  gray200: '#E5E7EB', gray400: '#9CA3AF', gray600: '#4B5563',
};

const plans = [
  {
    name: 'Student Free',
    price: '$0',
    period: 'forever',
    audience: 'For students',
    features: ['Browse all internship listings', 'Apply to unlimited opportunities', 'Upload profile & resume', 'Track all your applications', 'Receive messages from employers'],
    cta: 'Create free account',
    primary: false,
    role: '',
  },
  {
    name: 'Student Premium',
    price: '$5.99',
    period: '/month',
    audience: 'For ambitious students',
    features: ['Everything in Student Free', 'Priority placement in search results', 'Advanced search filters', 'Resume optimisation tips', 'Priority support'],
    cta: 'Start Premium',
    primary: true,
    role: '',
  },
  {
    name: 'Employer',
    price: '$29',
    period: '/month',
    audience: 'For companies',
    features: ['Post up to 5 active internships', 'Browse verified student profiles', 'Applicant management dashboard', 'Direct messaging with candidates', 'Application analytics'],
    cta: 'Post internships',
    primary: false,
    role: 'organization',
  },
];

export default function PublicPricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const getPath = (role) => {
    if (isAuthenticated) return '/dashboard';
    return role ? `/auth/register?role=${role}` : '/auth/register';
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.gray50, minHeight: '100vh' }}>
      <PublicNav />

      <section style={{ background: C.navy, padding: '72px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, color: C.white, marginBottom: 16 }}>Simple, transparent pricing</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 520, margin: '0 auto' }}>Students get started free. Employers pay only when they're ready to hire.</p>
      </section>

      <section style={{ maxWidth: 1050, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: plan.primary ? C.navy : C.white,
              borderRadius: 20,
              padding: '40px 36px',
              border: plan.primary ? `2px solid ${C.amber}` : `1px solid ${C.gray200}`,
              position: 'relative',
              boxShadow: plan.primary ? '0 24px 64px rgba(13,20,38,0.18)' : '0 2px 16px rgba(0,0,0,0.05)',
            }}>
              {plan.primary && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.amber, color: C.navy, fontSize: 12, fontWeight: 800, padding: '4px 18px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: plan.primary ? 'rgba(255,255,255,0.5)' : C.gray400, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{plan.audience}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: plan.primary ? C.white : C.navy, marginBottom: 12 }}>{plan.name}</h2>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: plan.primary ? C.amber : C.navy }}>{plan.price}</span>
                <span style={{ fontSize: 15, color: plan.primary ? 'rgba(255,255,255,0.45)' : C.gray400 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: plan.primary ? 'rgba(255,255,255,0.8)' : C.gray600 }}>
                    <CheckCircle size={17} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(getPath(plan.role))}
                style={{ width: '100%', background: plan.primary ? C.amber : C.navy, color: plan.primary ? C.navy : C.white, fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
              >
                {isAuthenticated ? 'Go to Dashboard' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ color: C.gray600, fontSize: 15 }}>
            All plans include a free trial period. No credit card required to sign up.{' '}
            <a href="/contact" onClick={e => { e.preventDefault(); navigate('/contact'); }} style={{ color: C.amber, fontWeight: 600, textDecoration: 'none' }}>Have questions? Contact us.</a>
          </p>
        </div>
      </section>

      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
