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

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.gray50, minHeight: '100vh' }}>
      <PublicNav />

      <section style={{ background: C.navy, padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: C.white, marginBottom: 12 }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>Last updated: June 2025</p>
      </section>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px 80px' }}>
        <div style={{ background: C.white, borderRadius: 20, padding: '48px 52px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>

          <Section title="1. Acceptance of terms">
            <p>By accessing or using InternshipConnect ("the platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 16 years old to create an account. Students under 18 should ensure they have parental or guardian consent before sharing personal information on the platform.</p>
          </Section>

          <Section title="3. Account responsibilities">
            <ul style={{ listStyle: 'disc', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to provide accurate information when registering and keep it up to date</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>You must notify us immediately of any unauthorised use of your account</li>
            </ul>
          </Section>

          <Section title="4. Acceptable use">
            <p>You agree NOT to:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>Post false, misleading, or fraudulent internship listings</li>
              <li>Impersonate another person or organisation</li>
              <li>Use the platform to send spam or unsolicited messages</li>
              <li>Attempt to access other users' accounts or private data</li>
              <li>Scrape, crawl, or copy content from the platform without permission</li>
              <li>Use the platform for any unlawful purpose</li>
            </ul>
          </Section>

          <Section title="5. Content">
            <p><strong>Your content:</strong> You retain ownership of content you submit (profile information, messages, internship listings). By posting content, you grant InternshipConnect a non-exclusive licence to display it to relevant users of the platform.</p>
            <p style={{ marginTop: 12 }}><strong>Our content:</strong> The InternshipConnect platform, its design, code, and branding are owned by InternshipConnect. You may not copy or reproduce them without permission.</p>
          </Section>

          <Section title="6. Internship listings">
            <p>Organisations posting internships are responsible for the accuracy of their listings. InternshipConnect does not guarantee the availability, accuracy, or legitimacy of any internship posted on the platform. We reserve the right to remove listings that violate these terms or our community standards.</p>
          </Section>

          <Section title="7. Payments and subscriptions">
            <p>Student accounts are free. Organisations may access premium features through a paid subscription. Pricing is displayed on the platform before purchase. All payments are processed securely. We do not store payment card details.</p>
            <p style={{ marginTop: 12 }}>Refunds are considered on a case-by-case basis. Contact us within 7 days of a charge if you believe you were billed in error.</p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>InternshipConnect is provided "as is". We do not guarantee uninterrupted service, or that you will secure an internship through the platform. We are not liable for any direct or indirect loss arising from use of the platform, including loss arising from interactions between students and organisations arranged through InternshipConnect.</p>
          </Section>

          <Section title="9. Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these terms, at our discretion. You may delete your account at any time through your account settings or by contacting us.</p>
          </Section>

          <Section title="10. Changes to these terms">
            <p>We may update these Terms of Service. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="11. Contact">
            <p>Questions about these terms? Email us at <a href="mailto:legal@internshipconnect.app" style={{ color: C.amber }}>legal@internshipconnect.app</a>.</p>
          </Section>

        </div>
      </main>

      <footer style={{ background: '#080E1C', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>© {new Date().getFullYear()} InternshipConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
