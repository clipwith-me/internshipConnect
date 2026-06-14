import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Search, MapPin, Briefcase, Users, Building2,
  GraduationCap, Star, CheckCircle, ChevronRight, Menu, X,
  TrendingUp, Shield, Zap, Globe
} from 'lucide-react';
import { internshipAPI } from '../services/api';

// ─── Brand colours ────────────────────────────────────────────────────────────
const C = {
  navy:     '#0D1426',
  navyMid:  '#1a2744',
  amber:    '#E8A230',
  amberDk:  '#c8871a',
  teal:     '#0D9488',
  white:    '#ffffff',
  gray50:   '#F9FAFB',
  gray100:  '#F3F4F6',
  gray200:  '#E5E7EB',
  gray400:  '#9CA3AF',
  gray600:  '#4B5563',
  gray900:  '#111827',
};

// ─── Unsplash free images (no attribution required) ──────────────────────────
const IMGS = {
  hero:       'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop',
  students:   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop',
  office:     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  mentoring:  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80&auto=format&fit=crop',
  team:       'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&auto=format&fit=crop',
  africaCity: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1200&q=80&auto=format&fit=crop',
  graduate:   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80&auto=format&fit=crop',
  laptop:     'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop',
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
function NavBar({ navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,20,38,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/logo-primary.png"
            alt="InternshipConnect"
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            onError={e => { e.target.src = '/logo-icon.png'; }}
          />
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14 }} className="hidden-mobile">
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>How it works</a>
          <a href="#for-employers" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>For Employers</a>
          <a href="#testimonials" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Success Stories</a>
          <a href="#pricing-preview" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Pricing</a>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">
          <button onClick={() => navigate('/auth/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
            Sign in
          </button>
          <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, fontSize: 14, fontWeight: 700, padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Get Started Free
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          style={{ background: 'none', border: 'none', color: C.white, cursor: 'pointer', padding: 6, display: 'none' }}
          className="show-mobile"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: C.navy, borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['How it works', 'For Employers', 'Pricing'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 15 }}>{link}</a>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          <button onClick={() => navigate('/auth/login')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: C.white, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Sign in</button>
          <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Get Started Free</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ navigate, stats }) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: C.navy }}>
      {/* Background image with overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${IMGS.hero})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, rgba(13,148,136,0.15) 100%)` }} />

      {/* Amber glow */}
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 500, height: 500, background: `radial-gradient(circle, rgba(232,162,48,0.12) 0%, transparent 70%)`, borderRadius: '50%' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: 700 }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,162,48,0.12)', border: '1px solid rgba(232,162,48,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.amber, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: C.amber, fontSize: 13, fontWeight: 600 }}>Africa's #1 Early-Career Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: C.white, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Where Students Launch{' '}
            <span style={{ color: C.amber }}>Careers</span>{' '}
            &amp; Companies Find{' '}
            <span style={{ color: C.teal, textDecoration: 'underline', textDecorationColor: 'rgba(13,148,136,0.4)', textUnderlineOffset: 6 }}>Talent</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
            InternshipConnect matches African students with quality internships at top companies.
            Build your profile, apply in minutes, get hired.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 56 }}>
            <button
              onClick={() => navigate('/auth/register')}
              style={{ background: C.amber, color: C.navy, fontSize: 16, fontWeight: 700, padding: '14px 32px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Find Internships <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/auth/register?role=organization')}
              style={{ background: 'rgba(255,255,255,0.08)', color: C.white, fontSize: 16, fontWeight: 600, padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
            >
              Post Internships
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { value: `${stats.students}+`, label: 'Students' },
              { value: `${stats.companies}+`, label: 'Companies' },
              { value: `${stats.internships}+`, label: 'Opportunities' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.amber }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image card — desktop only */}
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-45%)', width: 420, borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', display: 'none' }} className="hero-image-card">
          <img src={IMGS.students} alt="Students collaborating" style={{ width: '100%', height: 300, objectFit: 'cover' }} />
          {/* Floating card */}
          <div style={{ background: C.white, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.amber + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} color={C.amber} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>New match found!</div>
              <div style={{ fontSize: 12, color: C.gray600 }}>Software Engineer Intern — Lagos</div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 1024px) { .hero-image-card { display: block !important; } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        `}</style>
      </div>
    </section>
  );
}

// ─── Trusted by logos ─────────────────────────────────────────────────────────
function TrustedBy() {
  const companies = ['Google', 'Microsoft', 'Andela', 'Flutterwave', 'Paystack', 'MTN', 'Dangote', 'Access Bank'];
  return (
    <section style={{ background: C.white, padding: '40px 24px', borderBottom: `1px solid ${C.gray200}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', color: C.gray400, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
          Trusted by students at companies like
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px 48px', flexWrap: 'wrap' }}>
          {companies.map(name => (
            <span key={name} style={{ fontSize: 15, fontWeight: 700, color: C.gray400, letterSpacing: '-0.01em' }}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Search bar section ───────────────────────────────────────────────────────
function SearchSection({ navigate }) {
  const [query, setQuery]  = useState('');
  const [location, setLoc] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/auth/register?search=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <section style={{ background: C.gray50, padding: '64px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: C.navy, marginBottom: 12 }}>
          Find your perfect internship
        </h2>
        <p style={{ color: C.gray600, fontSize: 16, marginBottom: 32 }}>
          Search thousands of opportunities across Africa and beyond
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', background: C.white, borderRadius: 14, padding: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${C.gray200}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 2, minWidth: 180, padding: '0 12px' }}>
            <Search size={18} color={C.gray400} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Job title, skill, or company"
              style={{ border: 'none', outline: 'none', fontSize: 15, flex: 1, color: C.navy, background: 'transparent' }}
            />
          </div>
          <div style={{ width: 1, background: C.gray200, alignSelf: 'stretch' }} className="search-divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140, padding: '0 12px' }}>
            <MapPin size={18} color={C.gray400} />
            <input
              value={location}
              onChange={e => setLoc(e.target.value)}
              placeholder="City or country"
              style={{ border: 'none', outline: 'none', fontSize: 15, flex: 1, color: C.navy, background: 'transparent' }}
            />
          </div>
          <button type="submit" style={{ background: C.amber, color: C.navy, fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Search Jobs
          </button>
        </form>
        <p style={{ color: C.gray400, fontSize: 13, marginTop: 16 }}>
          Popular: <span style={{ color: C.amber, cursor: 'pointer' }} onClick={() => navigate('/auth/register')}>Software Engineering</span> · <span style={{ color: C.amber, cursor: 'pointer' }}>Marketing</span> · <span style={{ color: C.amber, cursor: 'pointer' }}>Finance</span> · <span style={{ color: C.amber, cursor: 'pointer' }}>Design</span>
        </p>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks({ navigate }) {
  const steps = [
    { n: '01', icon: GraduationCap, title: 'Create your profile', desc: 'Build a compelling profile with your education, skills, and experience. Upload your resume and let employers find you.' },
    { n: '02', icon: Search, title: 'Discover opportunities', desc: 'Browse thousands of internships filtered by role, location, industry, and compensation that match your goals.' },
    { n: '03', icon: Briefcase, title: 'Apply in one click', desc: 'Apply directly to internships with your profile. Track every application status in real-time on your dashboard.' },
    { n: '04', icon: TrendingUp, title: 'Launch your career', desc: 'Get shortlisted, interview, receive offers, and kickstart the career you have always dreamed of.' },
  ];
  return (
    <section id="how-it-works" style={{ background: C.white, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{ background: C.amber + '18', color: C.amberDk, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100, letterSpacing: '0.05em' }}>HOW IT WORKS</span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: C.navy, marginTop: 16, marginBottom: 12 }}>
            From search to hired in 4 steps
          </h2>
          <p style={{ color: C.gray600, fontSize: 17, maxWidth: 500, margin: '0 auto' }}>Simple, fast, and designed for African students.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: i === 0 ? C.amber : C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color={i === 0 ? C.navy : C.amber} />
                  </div>
                  <span style={{ fontSize: 42, fontWeight: 900, color: C.gray100, lineHeight: 1 }}>{step.n}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: C.gray600, fontSize: 15, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button onClick={() => navigate('/auth/register')} style={{ background: C.navy, color: C.white, fontSize: 15, fontWeight: 700, padding: '14px 36px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start for free <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Feature split sections ────────────────────────────────────────────────────
function FeatureSection() {
  const features = [
    {
      tag: 'FOR STUDENTS',
      title: 'Everything you need to land your first role',
      body: 'Create a standout profile, discover opportunities from top companies, track your applications, and get notified the moment employers respond.',
      bullets: ['AI-powered internship matching', 'Real-time application tracking', 'Resume builder & tips', 'Direct messaging with recruiters'],
      img: IMGS.laptop,
      imgAlt: 'Student using laptop to search internships',
      flip: false,
    },
    {
      tag: 'FOR EMPLOYERS',
      title: 'Find Africa\'s brightest emerging talent',
      body: 'Post internships in minutes, browse verified student profiles, manage applications on a single dashboard, and build your talent pipeline.',
      bullets: ['Verified student profiles', 'One-click shortlisting', 'Automated status notifications', 'Analytics & applicant insights'],
      img: IMGS.team,
      imgAlt: 'Team reviewing candidates',
      flip: true,
    },
  ];

  return (
    <>
      {features.map((f, i) => (
        <section key={i} id={i === 1 ? 'for-employers' : 'for-students'} style={{ background: i % 2 === 0 ? C.gray50 : C.white, padding: '96px 24px' }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 64, alignItems: 'center',
          }}>
            {/* Text side */}
            <div style={{ order: f.flip ? 2 : 1 }}>
              <span style={{ background: C.amber + '18', color: C.amberDk, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100, letterSpacing: '0.07em' }}>{f.tag}</span>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: C.navy, marginTop: 16, marginBottom: 16, lineHeight: 1.2 }}>{f.title}</h2>
              <p style={{ color: C.gray600, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>{f.body}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {f.bullets.map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.gray600, fontSize: 15 }}>
                    <CheckCircle size={18} color={C.teal} style={{ flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Image side */}
            <div style={{ order: f.flip ? 1 : 2, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
              <img src={f.img} alt={f.imgAlt} style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

// ─── Live internships ─────────────────────────────────────────────────────────
function LiveInternships({ internships, navigate }) {
  const fallback = [
    { title: 'Frontend Developer Intern', organization: { name: 'TechLagos' }, location: 'Lagos, Nigeria', type: 'remote', stipend: 150 },
    { title: 'Marketing Intern', organization: { name: 'GrowthCo Africa' }, location: 'Nairobi, Kenya', type: 'hybrid', stipend: 100 },
    { title: 'Data Analyst Intern', organization: { name: 'FinTrack Ltd' }, location: 'Accra, Ghana', type: 'onsite', stipend: 200 },
    { title: 'Product Design Intern', organization: { name: 'CreativeHub' }, location: 'Abuja, Nigeria', type: 'remote', stipend: 120 },
  ];

  const items = internships.length > 0 ? internships.slice(0, 4) : fallback;
  const typeBadge = { remote: { bg: '#ECFDF5', color: '#065F46' }, hybrid: { bg: '#EFF6FF', color: '#1D4ED8' }, onsite: { bg: '#FFF7ED', color: '#C2410C' } };

  return (
    <section style={{ background: C.white, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: C.navy, marginBottom: 8 }}>Latest Opportunities</h2>
            <p style={{ color: C.gray600, fontSize: 16 }}>Fresh internships posted by verified employers</p>
          </div>
          <button onClick={() => navigate('/auth/register')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.amber}`, color: C.amber, fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {items.map((job, i) => {
            // location is an object {type, city, country} — extract safely
            const locObj = typeof job.location === 'object' ? job.location : null;
            const type = locObj?.type || job.type || 'remote';
            const badge = typeBadge[type] || typeBadge.remote;
            const orgName = job.organization?.companyInfo?.companyName || job.organization?.name || 'Company';
            const locationStr = locObj
              ? ([locObj.city, locObj.country].filter(Boolean).join(', ') || type)
              : (typeof job.location === 'string' ? job.location : 'Africa');
            const stipend = job.compensation?.amount || job.stipend;
            return (
              <div
                key={i}
                onClick={() => navigate('/auth/register')}
                style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.gray200; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color={C.amber} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: badge.bg, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{job.title}</h3>
                <p style={{ fontSize: 14, color: C.gray600, marginBottom: 16 }}>{orgName}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.gray400 }}>
                    <MapPin size={13} />{locationStr}
                  </span>
                  {stipend > 0 && (
                    <span style={{ fontSize: 13, color: C.teal, fontWeight: 600 }}>
                      ${stipend}/mo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: 'Amara Okonkwo', role: 'Software Engineering Intern at Flutterwave', avatar: 'AO', text: 'InternshipConnect made it so easy. I built my profile on Monday, applied to 3 places, and had an interview by Friday. Landed my dream internship within 2 weeks.', stars: 5 },
    { name: 'Kwame Asante', role: 'Marketing Intern at Andela', avatar: 'KA', text: 'The platform is incredibly intuitive. The application tracking dashboard kept me organised and I never missed a deadline. Highly recommend to every African student.', stars: 5 },
    { name: 'Fatima Al-Hassan', role: 'Data Analyst Intern at MTN', avatar: 'FA', text: 'As someone who had never done a corporate internship, InternshipConnect guided me through the entire process. The profile tips alone helped me stand out.', stars: 5 },
  ];

  return (
    <section id="testimonials" style={{ background: C.navy, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ background: 'rgba(232,162,48,0.15)', color: C.amber, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100, letterSpacing: '0.05em' }}>SUCCESS STORIES</span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: C.white, marginTop: 16, marginBottom: 0 }}>Students love InternshipConnect</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {Array.from({ length: r.stars }).map((_, j) => <Star key={j} size={16} fill={C.amber} color={C.amber} />)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: C.navy, flexShrink: 0 }}>{r.avatar}</div>
                <div>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats/impact section ─────────────────────────────────────────────────────
function ImpactSection() {
  const items = [
    { value: '50K+', label: 'Students registered', icon: GraduationCap },
    { value: '2,000+', label: 'Partner companies', icon: Building2 },
    { value: '85%', label: 'Placement rate', icon: TrendingUp },
    { value: '12', label: 'African countries', icon: Globe },
  ];
  return (
    <section style={{ background: C.amber, padding: '72px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <Icon size={32} color={C.navy} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 40, fontWeight: 900, color: C.navy, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(13,20,38,0.7)', marginTop: 6, fontWeight: 500 }}>{item.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Pricing preview ──────────────────────────────────────────────────────────
function PricingPreview({ navigate }) {
  return (
    <section id="pricing-preview" style={{ background: C.gray50, padding: '96px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: C.navy, marginBottom: 12 }}>Simple, transparent pricing</h2>
        <p style={{ color: C.gray600, fontSize: 17 }}>Start for free. Upgrade when you're ready.</p>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {[
          { name: 'Free', price: '$0', period: 'forever', color: C.gray200, textColor: C.navy, features: ['Browse all internships', 'Apply to opportunities', 'Profile & resume upload', 'Application tracking'], cta: 'Get started free', primary: false },
          { name: 'Premium', price: '$5.99', period: '/month', color: C.navy, textColor: C.white, features: ['Everything in Free', 'Priority matching', 'Advanced search filters', 'Resume optimisation tips', 'Priority support'], cta: 'Start Premium', primary: true },
        ].map(plan => (
          <div key={plan.name} style={{ background: plan.primary ? C.navy : C.white, borderRadius: 20, padding: '36px 32px', border: plan.primary ? `2px solid ${C.amber}` : `1px solid ${C.gray200}`, position: 'relative', boxShadow: plan.primary ? '0 20px 60px rgba(13,20,38,0.15)' : 'none' }}>
            {plan.primary && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.amber, color: C.navy, fontSize: 12, fontWeight: 800, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
            <h3 style={{ fontSize: 20, fontWeight: 800, color: plan.textColor, marginBottom: 8 }}>{plan.name}</h3>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: plan.primary ? C.amber : C.navy }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: plan.primary ? 'rgba(255,255,255,0.5)' : C.gray400 }}>{plan.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.primary ? 'rgba(255,255,255,0.8)' : C.gray600 }}>
                  <CheckCircle size={16} color={C.amber} style={{ flexShrink: 0 }} />{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/auth/register')} style={{ width: '100%', background: plan.primary ? C.amber : C.navy, color: plan.primary ? C.navy : C.white, fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ navigate }) {
  return (
    <section style={{ background: C.navy, padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${IMGS.africaCity})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: `radial-gradient(circle, rgba(232,162,48,0.15), transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>
          Your career starts{' '}
          <span style={{ color: C.amber }}>today</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.7, marginBottom: 44 }}>
          Join tens of thousands of African students who have used InternshipConnect to launch their careers at top companies.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, fontWeight: 800, fontSize: 16, padding: '16px 40px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            Create free account <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/auth/register?role=organization')} style={{ background: 'rgba(255,255,255,0.08)', color: C.white, fontWeight: 700, fontSize: 16, padding: '16px 40px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            Post internships
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 24 }}>Free forever · No credit card needed</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer style={{ background: '#080E1C', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <img src="/logo-stacked.png" alt="InternshipConnect" style={{ height: 52, objectFit: 'contain', marginBottom: 16 }} onError={e => { e.target.src = '/logo-primary.png'; }} />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>Africa's leading platform for student internships and early-career opportunities.</p>
          </div>
          {/* Links */}
          {[
            { title: 'Students', links: ['Find Internships', 'Build Profile', 'Career Tips', 'Pricing'] },
            { title: 'Employers', links: ['Post Internships', 'Find Talent', 'Recruiter Tools', 'Pricing'] },
            { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}><a href="#" onClick={e => { e.preventDefault(); navigate('/auth/register'); }} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textDecoration: 'none' }}>{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Built for Africa 🌍</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState({ students: '50K', companies: '2K', internships: '10K' });

  useEffect(() => {
    internshipAPI.getAll({ limit: 4, sort: '-createdAt', status: 'active' })
      .then(res => {
        const list = res.data.data?.internships || res.data.data || [];
        setInternships(list);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <NavBar navigate={navigate} />
      <HeroSection navigate={navigate} stats={stats} />
      <TrustedBy />
      <SearchSection navigate={navigate} />
      <HowItWorks navigate={navigate} />
      <FeatureSection />
      <LiveInternships internships={internships} navigate={navigate} />
      <ImpactSection />
      <Testimonials />
      <PricingPreview navigate={navigate} />
      <FinalCTA navigate={navigate} />
      <Footer navigate={navigate} />
    </div>
  );
}
