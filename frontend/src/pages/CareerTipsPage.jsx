import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BookOpen, Briefcase, Users, Star, FileText, MessageSquare } from 'lucide-react';

const C = {
  navy: '#0D1426', amber: '#E8A230', amberDk: '#c8871a',
  teal: '#0D9488', white: '#ffffff',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray600: '#4B5563',
};

const tips = [
  {
    icon: FileText,
    title: 'Polish your profile before applying',
    body: 'Recruiters spend seconds scanning applications. Make sure your profile has a clear headline, a short bio that says what you study and what you want to do, and at least one project or experience — even a class project counts.',
    bullets: [
      'Use your real name and a professional photo',
      'Write a 2–3 sentence bio: who you are, what you study, what you\'re looking for',
      'List any skills you\'ve used, even in academic settings',
      'Upload your CV/resume as a PDF',
    ],
  },
  {
    icon: Briefcase,
    title: 'Apply to roles that match your actual skills',
    body: 'It\'s tempting to apply everywhere, but a targeted application beats ten unfocused ones. Read the description carefully — if you meet 60–70% of the requirements, apply. You don\'t need to tick every box.',
    bullets: [
      'Focus on roles in your field of study first',
      'Don\'t skip roles labelled "junior" or "intern" — they\'re the right level',
      'Remote roles expand your options significantly',
      'Set up notifications so you see new postings early',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Write a brief, personalised application message',
    body: 'When a platform allows you to add a note to your application, use it. One short paragraph showing you read the listing is enough to stand out from applicants who leave it blank.',
    bullets: [
      'Mention the specific role and company by name',
      'Say one thing that makes you a good fit',
      'Keep it to 3–5 sentences maximum',
      'Proofread before submitting — typos signal low effort',
    ],
  },
  {
    icon: Users,
    title: 'Follow up professionally',
    body: 'If you haven\'t heard back within 7–10 days of applying, a short follow-up is appropriate and shows initiative. Keep it brief and polite.',
    bullets: [
      'Wait at least a week before following up',
      'Use the messaging feature if available',
      'One follow-up is enough — don\'t send multiple messages',
      'If declined, thank them and ask for feedback if appropriate',
    ],
  },
  {
    icon: Star,
    title: 'Prepare for the interview',
    body: 'Most internship interviews focus on your attitude, curiosity, and potential — not years of experience. Research the company, prepare 2–3 questions to ask, and be honest about what you don\'t know.',
    bullets: [
      'Research what the company does and who their customers are',
      'Prepare a 60-second "tell me about yourself" answer',
      'Be ready to talk about a project, challenge you solved, or skill you\'re learning',
      'Ask questions — it shows you\'re genuinely interested',
    ],
  },
  {
    icon: BookOpen,
    title: 'Make the most of your internship',
    body: 'Landing the internship is just the beginning. How you show up each day determines what you learn, the references you earn, and whether it leads to more opportunities.',
    bullets: [
      'Show up on time and communicate proactively',
      'Ask questions — no one expects you to know everything',
      'Take notes in meetings, especially early on',
      'At the end, ask for a written recommendation or LinkedIn endorsement',
    ],
  },
];

export default function CareerTipsPage() {
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
        <span style={{ background: 'rgba(232,162,48,0.15)', color: C.amber, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100, letterSpacing: '0.05em', display: 'inline-block', marginBottom: 20 }}>CAREER TIPS</span>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, color: C.white, marginBottom: 16, lineHeight: 1.15 }}>
          How to land your first internship
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
          Practical, honest advice for students applying to internships — from profile setup to following up after an interview.
        </p>
      </section>

      {/* Tips */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} style={{ background: C.white, borderRadius: 20, padding: '36px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${C.gray200}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, background: C.navy, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color={C.amber} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gray400, letterSpacing: '0.07em' }}>TIP {String(i + 1).padStart(2, '0')}</span>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginTop: 2 }}>{tip.title}</h2>
                  </div>
                </div>
                <p style={{ color: C.gray600, fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>{tip.body}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tip.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: C.gray600, fontSize: 15 }}>
                      <CheckCircle size={17} color={C.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.navy, padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: C.white, marginBottom: 16 }}>Ready to apply?</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36 }}>Browse internships on InternshipConnect — free for students.</p>
        <button onClick={() => navigate('/auth/register')} style={{ background: C.amber, color: C.navy, fontWeight: 800, fontSize: 15, padding: '14px 40px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Find internships <ArrowRight size={17} />
        </button>
      </section>

      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
