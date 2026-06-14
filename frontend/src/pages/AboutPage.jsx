import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Heart, Globe } from 'lucide-react';

const C = {
  navy: '#0D1426', navyMid: '#1a2744', amber: '#E8A230',
  teal: '#0D9488', white: '#ffffff',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray600: '#4B5563',
};

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.gray50, minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: C.navy, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo-primary.png" alt="InternshipConnect" style={{ height: 36, objectFit: 'contain' }} onError={e => { e.target.src = '/logo-icon.png'; }} />
        </a>
        <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, fontWeight: 700, fontSize: 14, padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
          Get Started Free
        </button>
      </nav>

      {/* Hero */}
      <section style={{ background: C.navy, padding: '72px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: C.white, marginBottom: 16, lineHeight: 1.15 }}>
          About <span style={{ color: C.amber }}>InternshipConnect</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          A platform built to help African students find real internship opportunities and take their first steps into the professional world.
        </p>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 20 }}>Our story</h2>
        <p style={{ color: C.gray600, fontSize: 17, lineHeight: 1.9, marginBottom: 20 }}>
          InternshipConnect was created with one goal in mind: make it easier for African students to find and apply for internships without the friction of fragmented job boards, unanswered emails, and opaque application processes.
        </p>
        <p style={{ color: C.gray600, fontSize: 17, lineHeight: 1.9, marginBottom: 20 }}>
          Too many talented students miss out on valuable work experience simply because they don't know where to look, or companies don't know how to reach them. We're building the bridge between students ready to learn and companies ready to invest in the next generation.
        </p>
        <p style={{ color: C.gray600, fontSize: 17, lineHeight: 1.9 }}>
          We're an early-stage platform — which means your feedback directly shapes what we build. Every feature, every workflow, every improvement comes from listening to students and employers who use InternshipConnect every day.
        </p>
      </section>

      {/* Values */}
      <section style={{ background: C.white, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 48, textAlign: 'center' }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { icon: Target, title: 'Opportunity for all', body: 'Every student deserves a fair shot at work experience, regardless of their university ranking, city, or connections.' },
              { icon: Heart, title: 'Honest and transparent', body: 'No fake listings, no bait-and-switch pricing, no inflated numbers. We show you what's real and let the product speak for itself.' },
              { icon: Globe, title: 'Built for Africa', body: 'Africa's workforce is young, talented, and growing. We're designing tools that reflect the realities of the African job market, not copied from elsewhere.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ background: C.gray50, borderRadius: 16, padding: 32 }}>
                <div style={{ width: 52, height: 52, background: C.navy, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={24} color={C.amber} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: C.gray600, fontSize: 15, lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.navy, padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: C.white, marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36 }}>Join students and companies building something together.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, fontWeight: 800, fontSize: 15, padding: '14px 36px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            Create free account <ArrowRight size={17} />
          </button>
          <button onClick={() => navigate('/contact')} style={{ background: 'rgba(255,255,255,0.08)', color: C.white, fontWeight: 700, fontSize: 15, padding: '14px 36px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            Contact us
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
