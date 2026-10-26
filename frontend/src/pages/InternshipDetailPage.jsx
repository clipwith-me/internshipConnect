import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, FileText, Laptop, MapPin, Upload, Users, Wallet, X } from 'lucide-react';
import { applicationAPI, internshipAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, EmptyState, Modal, PageHeader } from '../components';
import StatusBadge from '../components/StatusBadge';
import { opportunityLabel } from '../utils/opportunity';
import {
  formatCompensation,
  formatPlace,
  getArrangement,
  getDeadline,
  getOrgName,
} from '../utils/internship';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE = 2 * 1024 * 1024;
const MAX_LETTER = 3000;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

const Fact = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <Icon size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
    <div>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="text-sm font-medium text-neutral-900">{children}</dd>
    </div>
  </div>
);

export default function InternshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [state, setState] = useState({ status: 'loading', data: null });
  const [existing, setExisting] = useState(null); // this student's application, if any
  const [open, setOpen] = useState(false);
  const [letter, setLetter] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null });
    internshipAPI
      .getById(id, { signal: controller.signal })
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        if (isAbortError(err)) return;
        setState({ status: err.response?.status === 404 ? 'missing' : 'error', data: null });
      });
    return () => controller.abort();
  }, [id]);

  // Has this student already applied? (prevents a confusing duplicate error)
  useEffect(() => {
    if (!isStudent) return undefined;
    const controller = new AbortController();
    applicationAPI
      .getMyApplications({ signal: controller.signal })
      .then((res) => {
        const list = res.data?.data?.applications || res.data?.data || [];
        const match = Array.isArray(list)
          ? list.find((a) => (a.internship?._id || a.internship) === id)
          : null;
        setExisting(match || null);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [id, isStudent]);

  useEffect(() => {
    if (state.data?.title) document.title = `${state.data.title} | InternshipConnect`;
  }, [state.data]);

  const closeModal = () => {
    setOpen(false);
    setSubmitError('');
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFileError('');
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Unsupported file type. Use PDF, DOC, DOCX or TXT.');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_FILE) {
      setFileError('File is too large. The maximum is 2 MB.');
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const form = new FormData();
      form.append('internshipId', id);
      if (letter.trim()) form.append('coverLetter', letter.trim());
      if (file) form.append('coverLetterFile', file);
      await applicationAPI.submit(form);
      setOpen(false);
      navigate('/dashboard/applications', { state: { justApplied: state.data?.title } });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'We could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (state.status === 'loading') {
    return <div className="mx-auto max-w-4xl animate-pulse space-y-4" aria-busy="true"><div className="h-10 w-2/3 rounded bg-neutral-200" /><div className="h-64 rounded-xl bg-neutral-200" /></div>;
  }

  if (state.status !== 'ready') {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          title={state.status === 'missing' ? 'This opportunity is no longer available' : "We couldn't load this opportunity"}
          description={state.status === 'missing' ? 'It may have been closed or removed by the employer.' : 'Please check your connection and try again.'}
          action={<Button as={Link} to="/dashboard/internships" variant="secondary">Back to internships</Button>}
        />
      </div>
    );
  }

  const i = state.data;
  const org = getOrgName(i);
  const place = formatPlace(i);
  const arrangement = getArrangement(i);
  const pay = formatCompensation(i);
  const deadline = getDeadline(i);
  const isOpen = i.status === 'active' && !deadline?.passed;
  const benefits = i.compensation?.benefits || [];
  const skills = (i.requirements?.skills || []).map((s) => s.name || s).filter(Boolean);
  const canSubmit = (letter.trim().length > 0 || file) && letter.length <= MAX_LETTER && !submitting;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        backTo="/dashboard/internships"
        backLabel="All opportunities"
        title={i.title}
        description={[opportunityLabel(i), org].filter(Boolean).join(' · ')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!isOpen && (
            <Alert variant="warning" title="Not accepting applications">
              {i.status === 'active' ? 'The application deadline has passed.' : 'The employer has closed or paused this listing.'}
            </Alert>
          )}

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-neutral-900">About this opportunity</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-700">{i.description}</p>
          </section>

          {i.flyer?.url && (
            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <a href={i.flyer.url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40" aria-label="Open the flyer in a new tab">
                <img src={i.flyer.url} alt={`Flyer for ${i.title}`} className="mx-auto max-h-[36rem] w-full object-contain" loading="lazy" />
              </a>
            </section>
          )}

          {(i.requirements?.description || skills.length > 0) && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Requirements</h2>
              {i.requirements?.description && (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-700">{i.requirements.description}</p>
              )}
              {skills.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills">
                  {skills.map((s) => (
                    <li key={s} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">{s}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {benefits.length > 0 && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Benefits</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-neutral-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <dl className="space-y-4">
              {(place || arrangement) && (
                <Fact icon={arrangement === 'Remote' ? Laptop : MapPin} label="Location">
                  {[place, arrangement].filter(Boolean).join(' · ')}
                </Fact>
              )}
              {pay && <Fact icon={Wallet} label="Compensation">{pay}</Fact>}
              {i.timeline?.startDate && (
                <Fact icon={Calendar} label="Dates">
                  {fmtDate(i.timeline.startDate)}{i.timeline.endDate ? ` – ${fmtDate(i.timeline.endDate)}` : ''}
                </Fact>
              )}
              {deadline && <Fact icon={Calendar} label="Deadline">{deadline.label}</Fact>}
              {typeof i.statistics?.applications === 'number' && (
                <Fact icon={Users} label="Applications so far">{i.statistics.applications}</Fact>
              )}
            </dl>

            <div className="mt-5 border-t border-neutral-100 pt-5">
              {isStudent && existing && (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600">You applied to this internship.</p>
                  <StatusBadge status={existing.status} />
                  <Button as={Link} to="/dashboard/applications" variant="secondary" fullWidth>Track application</Button>
                </div>
              )}
              {isStudent && !existing && (
                <Button fullWidth size="lg" disabled={!isOpen} onClick={() => setOpen(true)}>
                  {isOpen ? 'Apply now' : 'Applications closed'}
                </Button>
              )}
              {!isStudent && (
                <p className="text-sm text-neutral-600">Only student accounts can apply.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Modal isOpen={open} onClose={submitting ? undefined : closeModal} size="lg">
        <Modal.Title>Apply to {i.title}</Modal.Title>
        <div className="mt-4 space-y-5">
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <div>
            <label htmlFor="cover" className="mb-1.5 block text-sm font-medium text-neutral-800">Cover letter</label>
            <textarea
              id="cover"
              rows={6}
              value={letter}
              maxLength={MAX_LETTER}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Why are you interested, and what would you bring to the role?"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            />
            <p className="mt-1 text-xs text-neutral-500 tabular">{letter.length} / {MAX_LETTER}</p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-neutral-800">Or attach a file</p>
            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <span className="flex min-w-0 items-center gap-2 text-sm text-neutral-800">
                  <FileText size={18} className="shrink-0 text-neutral-500" aria-hidden="true" />
                  <span className="truncate">{file.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setFile(null); setFileError(''); }}
                  aria-label={`Remove ${file.name}`}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover-file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 hover:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/30"
              >
                <Upload size={18} aria-hidden="true" />
                <span>Choose a PDF, DOC, DOCX or TXT (max 2 MB)</span>
                <input id="cover-file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFile} className="sr-only" />
              </label>
            )}
            {fileError && <p className="mt-1.5 text-sm text-error-700" role="alert">{fileError}</p>}
          </div>

          <p className="text-xs text-neutral-500">
            Your profile and default resume are shared with the employer. Provide a letter, a file, or both.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button onClick={submit} disabled={!canSubmit} loading={submitting}>Submit application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
