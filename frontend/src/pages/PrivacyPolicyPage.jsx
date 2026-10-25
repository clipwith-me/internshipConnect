import { useEffect } from 'react';
import LegalDocument, { LegalSection } from '../components/LegalDocument';
import { CONTACT } from '../config/site';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy policy | InternshipConnect';
  }, []);

  const mail = CONTACT.privacy;

  return (
    <LegalDocument title="Privacy Policy" updated="October 2026">
      <LegalSection title="1. Introduction">
        <p>
          InternshipConnect ("we", "us", or "our") is committed to protecting your personal information. This
          Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you
          use our platform.
        </p>
        <p>By creating an account or using InternshipConnect, you agree to the practices described in this policy.</p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong>Account information:</strong> When you register, we collect your name, email address, password
          (stored as a bcrypt hash; we never store plain-text passwords), and your account role (student,
          organisation, or university).
        </p>
        <p>
          <strong>Profile information:</strong> Students may optionally provide their university, graduation year,
          skills, bio, and a resume/CV. Organisations may provide company name, description, and contact details.
          Universities provide the institution's name and contact details.
        </p>
        <p>
          <strong>Application data:</strong> When you apply for internships or post them, we store the relevant
          content (cover messages, internship details, application status updates).
        </p>
        <p>
          <strong>Usage data:</strong> We may collect basic analytics such as pages visited and actions taken, to
          understand how to improve the platform. We do not sell this data.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use your information and who can see it">
        <ul>
          <li>To operate and improve the InternshipConnect platform</li>
          <li>To match students with relevant internship opportunities</li>
          <li>To send transactional emails (e.g. application updates, account verification)</li>
          <li>To enable communication between students and employers via the platform</li>
          <li>To detect and prevent fraud or misuse</li>
        </ul>
        <p>
          <strong>Employers.</strong> When you apply for an internship, the employer that posted it can see your
          application, profile and resume. If your student profile is public, employers on the platform can also
          find it through candidate search.
        </p>
        <p>
          <strong>Universities.</strong> If you choose to link your account to a university, that university's
          career office can see your name, email address, and the status of your applications and placements. You
          can unlink at any time from your dashboard.
        </p>
        <p>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</p>
      </LegalSection>

      <LegalSection title="4. Data storage and security">
        <p>
          Your data is stored in a MongoDB Atlas cloud database. Our application servers are hosted on Render and
          our web app on Vercel. Profile pictures and company logos are stored with Cloudinary, and resumes and
          application documents are stored on our servers and database. We use industry-standard security practices
          including encrypted connections (TLS), hashed passwords, and access controls.
        </p>
        <p>
          Our service providers operate servers in several countries, including the United States, so your data may
          be transferred and processed outside Nigeria. We retain your data for as long as your account is active.
        </p>
      </LegalSection>

      <LegalSection title="5. Your rights">
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you</li>
          <li><strong>Correct</strong> inaccurate information via your profile settings</li>
          <li>
            <strong>Delete</strong> your account and associated personal data at any time from Settings. Deletion
            removes your resumes and profile details and withdraws any open applications. Records that other users
            rely on (such as an application in an employer's pipeline) are kept without your identity, and payment
            records are kept as required for accounting.
          </li>
          <li><strong>Withdraw consent</strong> for optional data processing at any time</li>
        </ul>
        <p>
          To exercise any of these rights, email us at <a href={`mailto:${mail}`}>{mail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and browser storage">
        <p>
          We do not use third-party tracking cookies or advertising cookies. To keep you signed in, we store
          authentication tokens in your browser's local storage, along with preferences such as your chosen theme.
          Clearing your browser data or signing out removes them.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party services">
        <p>We use the following third-party services to operate the platform:</p>
        <ul>
          <li><strong>Vercel</strong>: hosting for the web app</li>
          <li><strong>Render</strong>: hosting for our application servers</li>
          <li><strong>MongoDB Atlas</strong>: database hosting</li>
          <li><strong>Cloudinary</strong>: storage for profile pictures and logos</li>
          <li><strong>Brevo</strong>: transactional email delivery</li>
          <li><strong>Stripe</strong>: payment processing for paid plans (we do not store card details)</li>
          <li>
            <strong>An AI provider (OpenAI or Anthropic)</strong>: when AI-assisted resume generation is used, the
            details you provide for the resume are sent to the provider solely to generate the result
          </li>
        </ul>
        <p>Each of these services has its own privacy policy governing how it handles data.</p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will update the "last updated" date at
          the top of this page. Continued use of the platform after changes constitutes acceptance of the updated
          policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          If you have questions about this Privacy Policy, contact us at <a href={`mailto:${mail}`}>{mail}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
