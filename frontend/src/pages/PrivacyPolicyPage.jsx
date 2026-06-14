import PublicNav from '../components/PublicNav';

const C = {
  navy: '#0D1426', amber: '#E8A230', white: '#ffffff',
  gray50: '#F9FAFB', gray200: '#E5E7EB', gray600: '#4B5563',
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 48 }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${C.amber}` }}>{title}</h2>
    <div style={{ color: C.gray600, fontSize: 16, lineHeight: 1.9 }}>{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.gray50, minHeight: '100vh' }}>
      <PublicNav />

      <section style={{ background: C.navy, padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.white, marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>Last updated: June 2025</p>
      </section>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ background: C.white, borderRadius: 20, padding: '48px 52px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>

          <Section title="1. Introduction">
            <p>InternshipConnect ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you use our platform.</p>
            <p style={{ marginTop: 12 }}>By creating an account or using InternshipConnect, you agree to the practices described in this policy.</p>
          </Section>

          <Section title="2. Information we collect">
            <p><strong>Account information:</strong> When you register, we collect your name, email address, password (stored as a bcrypt hash — we never store plain-text passwords), and your account role (student or organisation).</p>
            <p style={{ marginTop: 12 }}><strong>Profile information:</strong> Students may optionally provide their university, graduation year, skills, bio, and a resume/CV. Organisations may provide company name, description, and contact details.</p>
            <p style={{ marginTop: 12 }}><strong>Application data:</strong> When you apply for internships or post them, we store the relevant content (cover messages, internship details, application status updates).</p>
            <p style={{ marginTop: 12 }}><strong>Usage data:</strong> We may collect basic analytics such as pages visited and actions taken, to understand how to improve the platform. We do not sell this data.</p>
          </Section>

          <Section title="3. How we use your information">
            <ul style={{ listStyle: 'disc', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>To operate and improve the InternshipConnect platform</li>
              <li>To match students with relevant internship opportunities</li>
              <li>To send transactional emails (e.g. application updates, account verification)</li>
              <li>To enable communication between students and employers via the platform</li>
              <li>To detect and prevent fraud or misuse</li>
            </ul>
            <p style={{ marginTop: 16 }}>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</p>
          </Section>

          <Section title="4. Data storage and security">
            <p>Your data is stored in a cloud database (Neon PostgreSQL) hosted on infrastructure in the US. We use industry-standard security practices including encrypted connections (TLS), hashed passwords, and access controls.</p>
            <p style={{ marginTop: 12 }}>Uploaded files (such as resumes) are stored using Vercel Blob storage. We retain your data for as long as your account is active.</p>
          </Section>

          <Section title="5. Your rights">
            <p>You have the right to:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate information via your profile settings</li>
              <li><strong>Delete</strong> your account and associated data by contacting us</li>
              <li><strong>Withdraw consent</strong> for optional data processing at any time</li>
            </ul>
            <p style={{ marginTop: 16 }}>To exercise any of these rights, email us at <a href="mailto:privacy@internshipconnect.app" style={{ color: C.amber }}>privacy@internshipconnect.app</a>.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We use a minimal set of cookies necessary for authentication (session tokens) and to remember your preferences. We do not use third-party tracking cookies or advertising cookies.</p>
          </Section>

          <Section title="7. Third-party services">
            <p>We use the following third-party services to operate the platform:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Vercel</strong> — hosting and file storage</li>
              <li><strong>Neon</strong> — database hosting</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
            </ul>
            <p style={{ marginTop: 12 }}>Each of these services has their own privacy policies governing how they handle data.</p>
          </Section>

          <Section title="8. Changes to this policy">
            <p>We may update this Privacy Policy from time to time. When we do, we will update the "last updated" date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:privacy@internshipconnect.app" style={{ color: C.amber }}>privacy@internshipconnect.app</a>.</p>
          </Section>

        </div>
      </main>

      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
