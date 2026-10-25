import { useEffect, useState } from 'react';
import { universityAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { Alert, Button, Input, PageHeader } from '../components';

const EMPTY = {
  name: '', shortName: '', website: '',
  contact: { coordinatorName: '', email: '', phone: '' },
  location: { city: '', state: '', country: '' },
};

/** Institution profile for the university role (name, contact, location). */
export default function UniversityProfilePage() {
  const [form, setForm] = useState(EMPTY);
  const [joinCode, setJoinCode] = useState('');
  const [state, setState] = useState({ status: 'loading', error: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Institution profile | InternshipConnect';
    const controller = new AbortController();
    universityAPI
      .getMe({ signal: controller.signal })
      .then((res) => {
        const u = res.data.data;
        setJoinCode(u.joinCode);
        setForm({
          name: u.name || '',
          shortName: u.shortName || '',
          website: u.website || '',
          contact: { ...EMPTY.contact, ...(u.contact || {}) },
          location: { ...EMPTY.location, ...(u.location || {}) },
        });
        setState({ status: 'ready', error: '' });
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setState({ status: 'error', error: err.response?.data?.message || 'We could not load your profile.' });
      });
    return () => controller.abort();
  }, []);

  const set = (path) => (e) => {
    const [group, key] = path.split('.');
    setForm((f) => (key ? { ...f, [group]: { ...f[group], [key]: e.target.value } } : { ...f, [group]: e.target.value }));
    setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your institution name';
    if (form.website && !/^https?:\/\/\S+\.\S+/.test(form.website)) next.website = 'Use a full address, e.g. https://unilag.edu.ng';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await universityAPI.updateMe({ ...form, name: form.name.trim() });
      setNotice({ variant: 'success', text: 'Profile saved.' });
    } catch (err) {
      setNotice({ variant: 'error', text: err.response?.data?.message || 'We could not save your changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (state.status === 'loading') {
    return <div className="h-64 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-busy="true" aria-label="Loading profile" />;
  }
  if (state.status === 'error') return <Alert variant="error" title="Couldn't load profile">{state.error}</Alert>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Institution profile" description="How your university appears to students and in reports." />

      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-medium text-neutral-700">Your join code</p>
        <p className="mt-1 font-mono text-xl font-semibold tracking-wider text-primary-700">{joinCode}</p>
        <p className="mt-1 text-sm text-neutral-500">Students enter this code (or pick your name) to link their account to your university.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8 rounded-xl border border-neutral-200 bg-white p-6">
        {notice && <Alert variant={notice.variant}>{notice.text}</Alert>}

        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-neutral-900">Institution</legend>
          <Input label="Name" required value={form.name} onChange={set('name')} error={errors.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Short name (optional)" value={form.shortName} onChange={set('shortName')} placeholder="e.g. UNILAG" />
            <Input label="Website (optional)" type="url" value={form.website} onChange={set('website')} error={errors.website} placeholder="https://" />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-neutral-900">Contact</legend>
          <Input label="Coordinator or office" value={form.contact.coordinatorName} onChange={set('contact.coordinatorName')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contact email" type="email" value={form.contact.email} onChange={set('contact.email')} />
            <Input label="Phone" type="tel" value={form.contact.phone} onChange={set('contact.phone')} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-neutral-900">Location</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="City" value={form.location.city} onChange={set('location.city')} />
            <Input label="State" value={form.location.state} onChange={set('location.state')} />
            <Input label="Country" value={form.location.country} onChange={set('location.country')} />
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </div>
  );
}
