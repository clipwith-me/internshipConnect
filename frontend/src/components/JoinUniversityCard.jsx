// frontend/src/components/JoinUniversityCard.jsx
import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { universityAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import Alert from './Alert';
import Button from './Button';

/**
 * Student-side university link.
 *  - not linked: pick a university from the list, or enter its join code
 *  - linked:     shows the university and lets the student unlink
 * Linking lets that university's career office see the student's name, email
 * and application/placement status (disclosed in the Privacy Policy).
 */
const JoinUniversityCard = () => {
  const [state, setState] = useState({ status: 'loading', linked: null, universities: [] });
  const [mode, setMode] = useState('select'); // 'select' | 'code'
  const [selected, setSelected] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { variant, text }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([universityAPI.getMine({ signal }), universityAPI.list(undefined, { signal })])
      .then(([mine, list]) =>
        setState({ status: 'ready', linked: mine.data.data, universities: list.data.data || [] })
      )
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', linked: null, universities: [] });
      });
    return () => controller.abort();
  }, []);

  const link = async () => {
    const payload = mode === 'code' ? { joinCode: code.trim() } : { universityId: selected };
    if ((mode === 'code' && !payload.joinCode) || (mode === 'select' && !selected)) {
      setMessage({ variant: 'error', text: mode === 'code' ? 'Enter your join code.' : 'Select your university.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await universityAPI.join(payload);
      const mine = await universityAPI.getMine();
      setState((s) => ({ ...s, linked: mine.data.data }));
      setSelected('');
      setCode('');
    } catch (err) {
      setMessage({ variant: 'error', text: err.response?.data?.message || 'We could not link your university. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await universityAPI.leave();
      setState((s) => ({ ...s, linked: null }));
      setMessage({ variant: 'success', text: 'You are no longer linked to a university.' });
    } catch (err) {
      setMessage({ variant: 'error', text: err.response?.data?.message || 'We could not unlink right now. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5" aria-labelledby="uni-link-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <GraduationCap size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="uni-link-heading" className="text-sm font-semibold text-neutral-900">
            {state.linked ? 'Your university' : 'Link your university'}
          </h2>

          {state.linked ? (
            <>
              <p className="mt-1 text-sm text-neutral-600">
                You're linked to <span className="font-medium text-neutral-900">{state.linked.name}</span>. Its career
                office can see your name, email and the status of your applications.
              </p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={unlink} loading={busy}>
                Unlink
              </Button>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-neutral-600">
                Optional. Linking lets your university's career office follow your applications and placements.
              </p>

              <div className="mt-3 inline-flex rounded-md border border-neutral-300 p-0.5" role="group" aria-label="How to link">
                {[['select', 'Choose from list'], ['code', 'Enter a code']].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    aria-pressed={mode === id}
                    className={`rounded px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      mode === id ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {mode === 'select' ? (
                  <>
                    <label htmlFor="uni-select" className="sr-only">University</label>
                    <select
                      id="uni-select"
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                    >
                      <option value="">
                        {state.universities.length ? 'Select your university…' : 'No universities registered yet'}
                      </option>
                      {state.universities.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}{u.location?.state ? ` (${u.location.state})` : ''}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="uni-code" className="sr-only">Join code</label>
                    <input
                      id="uni-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. UOL-7K3Q"
                      autoComplete="off"
                      className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 font-mono text-sm placeholder:font-sans placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                    />
                  </>
                )}
                <Button onClick={link} loading={busy}>Link</Button>
              </div>
            </>
          )}

          {message && <Alert variant={message.variant} className="mt-3">{message.text}</Alert>}
        </div>
      </div>
    </section>
  );
};

export default JoinUniversityCard;
