import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { resumeAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, EmptyState, Modal, PageHeader } from '../components';
import PricingModal from '../components/PricingModal';

const PLAN_LIMITS = { free: 3, premium: 10, pro: Infinity };

const STYLES = [
  { value: 'professional', label: 'Professional', description: 'Clean and formal, for corporate roles' },
  { value: 'creative', label: 'Creative', description: 'Bolder layout for design and creative fields' },
  { value: 'modern', label: 'Modern', description: 'Contemporary layout for tech and startups' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant for any industry' },
];

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ResumesPage() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [notice, setNotice] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const plan = user?.subscription?.plan || 'free';
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const load = useCallback(() => {
    return resumeAPI
      .getAll()
      .then((res) => setState({ status: 'ready', items: res.data?.data || [] }))
      .catch(() => setState({ status: 'error', items: [] }));
  }, []);

  useEffect(() => {
    document.title = 'My resumes | InternshipConnect';
    load();
  }, [load]);

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const usedThisMonth = state.items.filter((r) => new Date(r.createdAt) >= startOfMonth).length;
  const atLimit = Number.isFinite(limit) && usedThisMonth >= limit;

  const openGenerate = () => {
    if (atLimit) setShowPricing(true);
    else setShowGenerate(true);
  };

  const generate = async (customization) => {
    setGenerating(true);
    setNotice(null);
    try {
      // A resume needs these profile sections to say anything useful.
      const profile = (await studentAPI.getProfile()).data?.data || {};
      const missing = [];
      if (!profile.personalInfo?.firstName || !profile.personalInfo?.lastName) missing.push('your name');
      if (!profile.education?.length) missing.push('at least one education entry');
      if ((profile.skills?.length || 0) < 3) missing.push('at least three skills');
      if (missing.length) {
        setShowGenerate(false);
        setNotice({ type: 'warning', text: `Add ${missing.join(', ')} to your profile first.`, profile: true });
        return;
      }

      await resumeAPI.generate({ customization });
      setShowGenerate(false);
      setNotice({ type: 'success', text: 'Your resume is ready.' });
      await load();
    } catch (err) {
      const msg = err.response?.data?.error || 'We could not generate your resume. Please try again.';
      if (err.response?.data?.upgradeRequired || /plan allows/i.test(msg)) {
        setShowGenerate(false);
        setShowPricing(true);
      } else {
        setShowGenerate(false);
        setNotice({ type: 'error', text: msg });
      }
    } finally {
      setGenerating(false);
    }
  };

  const remove = async () => {
    const r = toDelete;
    setBusyId(r._id);
    try {
      await resumeAPI.delete(r._id);
      setToDelete(null);
      setNotice({ type: 'success', text: 'Resume deleted.' });
      await load();
    } catch (err) {
      setToDelete(null);
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not delete this resume.' });
    } finally {
      setBusyId(null);
    }
  };

  const download = async (resume) => {
    setBusyId(resume._id);
    try {
      const res = await resumeAPI.download(resume._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.aiGenerated?.fileName || `resume-v${resume.version || 1}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setNotice({ type: 'error', text: 'We could not download that resume. Please try again.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="My resumes"
        description="Create resumes from your profile and download them as PDF."
        actions={<Button onClick={openGenerate} icon={<Plus size={16} aria-hidden="true" />}>New resume</Button>}
      />

      {Number.isFinite(limit) && (
        <Alert variant={atLimit ? 'warning' : 'info'} className="mb-5">
          {atLimit
            ? `You've used all ${limit} resumes for this month on the ${plan} plan.`
            : `${usedThisMonth} of ${limit} resumes used this month. The count resets on the 1st.`}{' '}
          {atLimit && (
            <button type="button" onClick={() => setShowPricing(true)} className="font-semibold underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              See plans
            </button>
          )}
        </Alert>
      )}

      {notice && (
        <Alert variant={notice.type} onDismiss={() => setNotice(null)} className="mb-5">
          {notice.text}{' '}
          {notice.profile && <Link to="/dashboard/profile" className="font-semibold underline">Open profile</Link>}
        </Alert>
      )}

      {state.status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <EmptyState title="We couldn't load your resumes" description="Please check your connection and try again." action={<Button variant="secondary" onClick={load}>Try again</Button>} />
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Generate one from your profile in a few seconds."
          action={<Button onClick={openGenerate}>Create a resume</Button>}
        />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((r) => {
            const style = r.aiGenerated?.customization?.template || 'professional';
            const score = r.aiGenerated?.analysis?.atsScore;
            return (
              <li key={r._id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700" aria-hidden="true"><FileText size={22} /></span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">{style}</span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-neutral-900">Resume v{r.version || 1}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600"><Calendar size={14} aria-hidden="true" />Created {fmt(r.aiGenerated?.generatedAt || r.createdAt)}</p>

                {typeof score === 'number' && (
                  <div className="mt-3" title="An automated estimate, not a guarantee of how an employer's system will rate it">
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Keyword match (estimate)</span>
                      <span className="font-medium text-neutral-900 tabular">{score}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-neutral-200" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Keyword match estimate">
                      <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${Math.min(100, score)}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => download(r)} loading={busyId === r._id} icon={<Download size={15} aria-hidden="true" />}>Download</Button>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(r)} aria-label={`Delete resume v${r.version || 1}`} icon={<Trash2 size={15} aria-hidden="true" />} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GenerateModal open={showGenerate} onClose={() => !generating && setShowGenerate(false)} onGenerate={generate} generating={generating} />

      <Modal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} size="sm">
        <Modal.Title>Delete this resume?</Modal.Title>
        <p className="mt-2 text-sm text-neutral-600">Resume v{toDelete?.version || 1} will be permanently removed.</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Keep it</Button>
          <Button variant="danger" onClick={remove} loading={busyId === toDelete?._id}>Delete</Button>
        </div>
      </Modal>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} currentUsage={usedThisMonth} limit={Number.isFinite(limit) ? limit : 'unlimited'} />
    </div>
  );
}

function GenerateModal({ open, onClose, onGenerate, generating }) {
  const [style, setStyle] = useState('professional');
  return (
    <Modal isOpen={open} onClose={onClose} size="lg">
      <Modal.Title>Create a resume</Modal.Title>
      <p className="mt-1 text-sm text-neutral-600">Built from your profile: education, skills and experience.</p>
      <fieldset className="mt-4">
        <legend className="sr-only">Resume style</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {STYLES.map((s) => (
            <label
              key={s.value}
              className={`cursor-pointer rounded-lg border p-4 focus-within:ring-4 focus-within:ring-primary-500/30 ${style === s.value ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <input type="radio" name="style" value={s.value} checked={style === s.value} onChange={() => setStyle(s.value)} className="sr-only" />
              <span className="block font-semibold text-neutral-900">{s.label}</span>
              <span className="mt-0.5 block text-sm text-neutral-600">{s.description}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={generating}>Cancel</Button>
        <Button onClick={() => onGenerate(style)} loading={generating}>Create resume</Button>
      </div>
    </Modal>
  );
}
