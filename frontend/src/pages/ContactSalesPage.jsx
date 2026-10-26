import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { CONTACT } from '../config/site';
import { Alert, Button, Input } from '../components';
import PageHero from '../components/PageHero';

const SIZES = ['1–10', '11–50', '51–200', '201–500', '501+'];

/**
 * There is no server endpoint for this form, so it composes an email in the
 * visitor's own mail app and says so, instead of pretending it was delivered.
 */
export default function ContactSalesPage() {
  const [prepared, setPrepared] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', size: '', message: '' });

  useEffect(() => {
    document.title = 'Contact sales | InternshipConnect';
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nCompany size: ${form.size || 'Not given'}\n\n${form.message}`
    );
    const subject = encodeURIComponent(`Sales enquiry: ${form.company}`);
    window.location.href = `mailto:${CONTACT.sales}?subject=${subject}&body=${body}`;
    setPrepared(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Sales"
        title="Talk to us about hiring"
        description="Tell us about your organisation and what you want to hire for, and we'll get back to you."
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">Email us directly</h2>
          <div className="mt-6 flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-neutral-600">Sales</p>
              <a href={`mailto:${CONTACT.sales}`} className="break-all rounded font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                {CONTACT.sales}
              </a>
            </div>
          </div>
          <p className="mt-8 text-sm leading-relaxed text-neutral-600">
            Posting a role is free: create an employer account and publish from your dashboard. Contact us if you
            need something beyond the plans on the pricing page.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
          {prepared ? (
            <div className="py-4">
              <Alert variant="success" title="Your message is ready to send">
                We've opened your email app with the details filled in. Press send there to reach us. If nothing opened,
                email <a className="font-medium underline" href={`mailto:${CONTACT.sales}`}>{CONTACT.sales}</a> directly.
              </Alert>
              <Button variant="secondary" className="mt-5" onClick={() => setPrepared(false)}>Write another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="text-lg font-semibold text-neutral-900">Your details</h2>
              <Input label="Full name" required autoComplete="name" value={form.name} onChange={set('name')} />
              <Input label="Work email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
              <Input label="Organisation" required autoComplete="organization" value={form.company} onChange={set('company')} />
              <div>
                <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-neutral-800">Organisation size</label>
                <select
                  id="size"
                  value={form.size}
                  onChange={set('size')}
                  className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                >
                  <option value="">Select a range</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s} people</option>)}
                </select>
              </div>
              <Input
                label="How can we help?"
                type="textarea"
                rows={5}
                required
                maxLength={2000}
                showCount
                value={form.message}
                onChange={set('message')}
                helperText="This opens your email app so you can review and send it."
              />
              <Button type="submit" size="lg" fullWidth>Prepare message</Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
