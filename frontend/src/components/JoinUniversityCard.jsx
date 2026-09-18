// frontend/src/components/JoinUniversityCard.jsx
import { useEffect, useState } from 'react';
import { School, Check, X } from 'lucide-react';
import { universityAPI } from '../services/api';

/**
 * Lets a student link their account to a registered university, either by
 * picking it from the directory or entering the university's join code.
 * Self-dismisses once the student is already affiliated.
 */
const JoinUniversityCard = () => {
  const [universities, setUniversities] = useState([]);
  const [selected, setSelected] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('select'); // 'select' | 'code'
  const [joined, setJoined] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    universityAPI.list()
      .then((res) => setUniversities(res.data.data || []))
      .catch(() => {});
  }, []);

  const submit = async () => {
    setError('');
    const payload = mode === 'code'
      ? { joinCode: code.trim() }
      : { universityId: selected };
    if ((mode === 'code' && !code.trim()) || (mode === 'select' && !selected)) {
      setError(mode === 'code' ? 'Enter your join code.' : 'Select your university.');
      return;
    }
    setBusy(true);
    try {
      const res = await universityAPI.join(payload);
      setJoined(res.data.data?.name || 'your university');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not link your university.');
    } finally {
      setBusy(false);
    }
  };

  if (dismissed) return null;

  if (joined) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={18} /></span>
        <p className="text-sm text-emerald-800">You're now linked to <span className="font-semibold">{joined}</span>. Your career office can see your progress.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center"><School size={20} /></span>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Link your university</h3>
            <p className="text-xs text-neutral-500">Connect to your school so your career office can support your search.</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-neutral-400 hover:text-neutral-600" aria-label="Dismiss"><X size={16} /></button>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode('select')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${mode === 'select' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Choose from list</button>
        <button onClick={() => setMode('code')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${mode === 'code' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>Enter a code</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {mode === 'select' ? (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
          >
            <option value="">Select your university…</option>
            {universities.map((u) => (
              <option key={u._id} value={u._id}>{u.name}{u.location?.state ? ` — ${u.location.state}` : ''}</option>
            ))}
          </select>
        ) : (
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. UOL-7K3Q"
            className="flex-1 px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
          />
        )}
        <button
          onClick={submit}
          disabled={busy}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {busy ? 'Linking…' : 'Link'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default JoinUniversityCard;
