import { useEffect, useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { CONTACT } from '../config/site';
import { Alert, Button, Input } from '../components';
import PageHero from '../components/PageHero';

/**
 * The contact form composes an email in the visitor's own mail app (there is no
 * server endpoint for it). The page says so plainly instead of implying the
 * message has already been delivered.
 */
export default function ContactPage() {
  const [prepared, setPrepared] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    document.title = 'Contact | InternshipConnect';
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    const subject = encodeURIComponent(form.subject || 'Enquiry from website');
    window.location.href = `mailto:${CONTACT.general}?subject=${subject}&body=${body}`;
    setPrepared(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact us"
        description="Have a question, feedback, or a partnership idea? We'd love to hear from you."
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">Get in touch</h2>
          <ul className="mt-6 space-y-6">
            {[
              { icon: Mail, title: 'General enquiries', value: CONTACT.general },
              { icon: MessageSquare, title: 'Support', value: CONTACT.support },
            ].map(({ icon: Icon, title, value }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-500">{title}</p>
                  <a
                    href={`mailto:${value}`}
                    className="break-all rounded font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {value}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-lg bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-600">
            <strong className="text-neutral-800">Please note:</strong> we reply as soon as we can. For urgent
            issues, include "URGENT" in your subject line.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
          {prepared ? (
            <div className="py-6">
              <Alert variant="success" title="Your message is ready to send">
                We've opened your email app with the message filled in. Press send there to reach us. If nothing
                opened, email us directly at{' '}
                <a className="font-medium underline" href={`mailto:${CONTACT.general}`}>{CONTACT.general}</a>.
              </Alert>
              <Button variant="secondary" className="mt-5" onClick={() => setPrepared(false)}>
                Write another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-semibold text-neutral-900">Send us a message</h2>
              <Input label="Your name" required autoComplete="name" value={form.name} onChange={set('name')} />
              <Input label="Your email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
              <Input label="Subject" required value={form.subject} onChange={set('subject')} />
              <Input
                label="Message"
                type="textarea"
                rows={5}
                required
                maxLength={2000}
                showCount
                value={form.message}
                onChange={set('message')}
                helperText="This opens your email app so you can review and send it."
              />
              <Button type="submit" size="lg" fullWidth>
                Prepare message
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
