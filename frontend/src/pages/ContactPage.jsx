import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ArrowRight } from 'lucide-react';

const C = {
  navy: '#0D1426', amber: '#E8A230', amberDk: '#c8871a',
  teal: '#0D9488', white: '#ffffff',
  gray50: '#F9FAFB', gray200: '#E5E7EB', gray400: '#9CA3AF', gray600: '#4B5563',
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opens the user's email client with pre-filled content
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:hello@internshipconnect.app?subject=${encodeURIComponent(form.subject || 'Enquiry from website')}&body=${body}`;
    setSent(true);
  };

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
      <section style={{ background: C.navy, padding: '64px 24px 56px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.white, marginBottom: 12 }}>Contact us</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>Have a question, feedback, or a partnership idea? We'd love to hear from you.</p>
      </section>

      {/* Content */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>

        {/* Info */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 24 }}>Get in touch</h2>
          {[
            { icon: Mail, title: 'General enquiries', value: 'hello@internshipconnect.app' },
            { icon: MessageSquare, title: 'Support', value: 'support@internshipconnect.app' },
          ].map(({ icon: Icon, title, value }) => (
            <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, background: C.navy, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={C.amber} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray400, marginBottom: 4 }}>{title}</div>
                <a href={`mailto:${value}`} style={{ fontSize: 16, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>{value}</a>
              </div>
            </div>
          ))}

          <div style={{ background: C.amber + '18', border: `1px solid ${C.amber}44`, borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
            <p style={{ color: C.navy, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong>Response time:</strong> We typically respond within 1–2 business days. For urgent issues, include "URGENT" in your subject line.
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: C.white, borderRadius: 20, padding: '36px 40px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', border: `1px solid ${C.gray200}` }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Opening your email app…</h3>
              <p style={{ color: C.gray600, fontSize: 15, lineHeight: 1.7 }}>Your message has been prepared. Send it from your email client to reach us.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Send us a message</h3>
              {[
                { name: 'name', label: 'Your name', type: 'text', placeholder: 'Amara Okonkwo' },
                { name: 'email', label: 'Your email', type: 'email', placeholder: 'amara@example.com' },
                { name: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    required
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 15, color: C.navy, outline: 'none', background: C.gray50 }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: 'block', marginBottom: 6 }}>Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us what you need help with…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: `1px solid ${C.gray200}`, borderRadius: 8, fontSize: 15, color: C.navy, outline: 'none', resize: 'vertical', background: C.gray50, fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" style={{ background: C.navy, color: C.white, fontWeight: 700, fontSize: 15, padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Send message <ArrowRight size={17} />
              </button>
            </form>
          )}
        </div>
      </main>

      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
