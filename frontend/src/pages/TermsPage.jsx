import { useEffect } from 'react';
import LegalDocument, { LegalSection } from '../components/LegalDocument';
import { CONTACT } from '../config/site';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of service | InternshipConnect';
  }, []);

  const mail = CONTACT.legal;

  return (
    <LegalDocument title="Terms of Service" updated="October 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By accessing or using InternshipConnect ("the platform"), you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 16 years old to create an account. Students under 18 should ensure they have parental
          or guardian consent before sharing personal information on the platform.
        </p>
      </LegalSection>

      <LegalSection title="3. Account responsibilities">
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You agree to provide accurate information when registering and keep it up to date</li>
          <li>You are responsible for all activity that occurs under your account</li>
          <li>You must notify us immediately of any unauthorised use of your account</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree NOT to:</p>
        <ul>
          <li>Post false, misleading, or fraudulent internship listings</li>
          <li>Impersonate another person or organisation</li>
          <li>Use the platform to send spam or unsolicited messages</li>
          <li>Attempt to access other users' accounts or private data</li>
          <li>Scrape, crawl, or copy content from the platform without permission</li>
          <li>Use the platform for any unlawful purpose</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Content">
        <p>
          <strong>Your content:</strong> You retain ownership of content you submit (profile information, messages,
          internship listings). By posting content, you grant InternshipConnect a non-exclusive licence to display it
          to relevant users of the platform.
        </p>
        <p>
          <strong>Our content:</strong> The InternshipConnect platform, its design, code, and branding are owned by
          InternshipConnect. You may not copy or reproduce them without permission.
        </p>
      </LegalSection>

      <LegalSection title="6. Internship listings">
        <p>
          Organisations posting internships are responsible for the accuracy of their listings. InternshipConnect
          does not guarantee the availability, accuracy, or legitimacy of any internship posted on the platform. We
          reserve the right to remove listings that violate these terms or our community standards.
        </p>
      </LegalSection>

      <LegalSection title="7. Payments and subscriptions">
        <p>
          Core features are free for students, and organisations can start for free. Optional paid plans are
          available for students and organisations. Prices and what each plan includes are shown on the pricing page
          before purchase. Payments are processed securely by Stripe, and we do not store payment card details.
        </p>
        <p>
          Refunds are considered on a case-by-case basis. Contact us within 7 days of a charge if you believe you
          were billed in error.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          InternshipConnect is provided "as is". We do not guarantee uninterrupted service, or that you will secure
          an internship through the platform. We are not liable for any direct or indirect loss arising from use of
          the platform, including loss arising from interactions between students and organisations arranged through
          InternshipConnect.
        </p>
      </LegalSection>

      <LegalSection title="9. Termination">
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms, at our discretion. You may
          delete your account at any time from Settings, or by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these terms">
        <p>
          We may update these Terms of Service. Continued use of the platform after changes are posted constitutes
          acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these terms? Email us at <a href={`mailto:${mail}`}>{mail}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
