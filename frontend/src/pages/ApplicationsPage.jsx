import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Calendar, Download, Eye, FileText, Mail } from 'lucide-react';
import { applicationAPI, resumeAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, EmptyState, Modal, PageHeader } from '../components';
import StatusBadge from '../components/StatusBadge';
import { getOrgName } from '../utils/internship';
import { APPLICATION_STATUS, nextApplicationStatuses } from '../utils/status';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const studentName = (a) => {
  const p = a.student?.personalInfo;
  return [p?.firstName, p?.lastName].filter(Boolean).join(' ') || 'Applicant';
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isOrg = user?.role === 'organization';

  const [state, setState] = useState({ status: 'loading', items: [] });
  const [notice, setNotice] = useState(location.state?.justApplied ? { type: 'success', text: `Application submitted for ${location.state.justApplied}.` } : null);
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    document.title = `${isOrg ? 'Applicants' : 'My applications'} | InternshipConnect`;
  }, [isOrg]);

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    const request = isOrg
      ? applicationAPI.getOrganizationApplications({ limit: 100 }, config)
      : applicationAPI.getMyApplications(config);
    request
      .then((res) => setState({ status: 'ready', items: res.data?.data?.applications || res.data?.data || [] }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', items: [] });
      });
    return () => controller.abort();
  }, [isOrg, reload]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setNotice(null);
    try {
      await applicationAPI.updateStatus(id, status);
      setNotice({ type: 'success', text: `Moved to “${APPLICATION_STATUS[status]?.label || status}”.` });
      refresh();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not update the status.' });
    } finally {
      setBusyId(null);
    }
  };

  const withdraw = async () => {
    const app = confirmWithdraw;
    setBusyId(app._id);
    try {
      await applicationAPI.withdraw(app._id);
      setConfirmWithdraw(null);
      setNotice({ type: 'success', text: 'Application withdrawn.' });
      refresh();
    } catch (err) {
      setConfirmWithdraw(null);
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not withdraw this application.' });
    } finally {
      setBusyId(null);
    }
  };

  const openProfile = async (app) => {
    setBusyId(app._id);
    try {
      const res = await resumeAPI.viewApplicant(app._id);
      setProfile(res.data?.data);
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not load the applicant profile.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={isOrg ? 'Applicants' : 'My applications'}
        description={isOrg ? 'Review candidates and move them through your hiring pipeline.' : 'Track every application and see where it stands.'}
      />

      {notice && (
        <Alert variant={notice.type} onDismiss={() => setNotice(null)} className="mb-5">{notice.text}</Alert>
      )}

      {state.status === 'loading' && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-32 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <EmptyState title="We couldn't load applications" description="Please check your connection and try again." action={<Button variant="secondary" onClick={refresh}>Try again</Button>} />
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title={isOrg ? 'No applications yet' : "You haven't applied yet"}
          description={isOrg ? 'When students apply to your internships, they appear here.' : 'Find an internship that fits and apply with your profile.'}
          action={<Button as={Link} to={isOrg ? '/dashboard/my-internships' : '/dashboard/internships'}>{isOrg ? 'View my listings' : 'Browse internships'}</Button>}
        />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="space-y-4">
          {state.items.map((a) => {
            const options = isOrg ? nextApplicationStatuses(a.status) : [];
            const canWithdraw = !isOrg && ['submitted', 'under-review'].includes(a.status);
            return (
              <li key={a._id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {isOrg ? studentName(a) : a.internship?.title || 'Internship'}
                    </h2>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      {isOrg ? `Applied for ${a.internship?.title || 'an internship'}` : getOrgName(a.internship) || 'Employer'}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-600">
                  <Calendar size={15} aria-hidden="true" /> Applied {fmt(a.createdAt)}
                </p>

                {a.coverLetter && (
                  <p className="mt-3 line-clamp-3 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">{a.coverLetter}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isOrg && (
                    <Button size="sm" variant="secondary" onClick={() => openProfile(a)} loading={busyId === a._id} icon={<Eye size={16} aria-hidden="true" />}>
                      Profile &amp; resume
                    </Button>
                  )}
                  {!isOrg && a.internship?._id && (
                    <Button as={Link} size="sm" variant="secondary" to={`/dashboard/internships/${a.internship._id}`}>View internship</Button>
                  )}
                  {canWithdraw && (
                    <Button size="sm" variant="danger" onClick={() => setConfirmWithdraw(a)}>Withdraw</Button>
                  )}
                  {options.length > 0 && (
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <label htmlFor={`st-${a._id}`} className="text-sm font-medium text-neutral-700">Move to</label>
                      <select
                        id={`st-${a._id}`}
                        value=""
                        disabled={busyId === a._id}
                        onChange={(e) => e.target.value && updateStatus(a._id, e.target.value)}
                        className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                      >
                        <option value="">Choose stage…</option>
                        {options.map((s) => <option key={s} value={s}>{APPLICATION_STATUS[s]?.label || s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal isOpen={Boolean(confirmWithdraw)} onClose={() => setConfirmWithdraw(null)} size="sm">
        <Modal.Title>Withdraw application?</Modal.Title>
        <p className="mt-2 text-sm text-neutral-600">
          You will withdraw from “{confirmWithdraw?.internship?.title}”. This cannot be undone.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmWithdraw(null)}>Keep application</Button>
          <Button variant="danger" onClick={withdraw} loading={busyId === confirmWithdraw?._id}>Withdraw</Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(profile)} onClose={() => setProfile(null)} size="xl">
        <Modal.Title>Applicant profile</Modal.Title>
        {profile && <ApplicantProfile data={profile} />}
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setProfile(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section className="mt-5">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
    <div className="mt-2 space-y-2">{children}</div>
  </section>
);

function ApplicantProfile({ data }) {
  const s = data.student || {};
  const p = s.personalInfo || {};
  const year = (d) => (d ? new Date(d).getFullYear() : '');
  return (
    <div className="mt-3">
      <p className="text-lg font-semibold text-neutral-900">{[p.firstName, p.lastName].filter(Boolean).join(' ')}</p>
      {s.headline && <p className="text-sm text-neutral-600">{s.headline}</p>}
      {s.email && (
        <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600"><Mail size={15} aria-hidden="true" />{s.email}</p>
      )}

      {s.education?.length > 0 && (
        <Section title="Education">
          {s.education.map((e, i) => (
            <div key={i} className="rounded-md bg-neutral-50 p-3 text-sm">
              <p className="font-medium text-neutral-900">{e.institution}</p>
              <p className="text-neutral-600">{[e.degree, e.fieldOfStudy].filter(Boolean).join(' in ')}</p>
              <p className="text-neutral-500">{year(e.startDate)} – {e.current ? 'Present' : year(e.endDate)}</p>
            </div>
          ))}
        </Section>
      )}

      {s.skills?.length > 0 && (
        <Section title="Skills">
          <ul className="flex flex-wrap gap-2">
            {s.skills.map((k, i) => <li key={i} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">{k.name}</li>)}
          </ul>
        </Section>
      )}

      {s.experience?.length > 0 && (
        <Section title="Experience">
          {s.experience.map((x, i) => (
            <div key={i} className="rounded-md bg-neutral-50 p-3 text-sm">
              <p className="font-medium text-neutral-900">{x.title}{x.company ? ` · ${x.company}` : ''}</p>
              {x.description && <p className="mt-1 text-neutral-600">{x.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {data.resumes?.length > 0 && (
        <Section title="Resumes">
          {data.resumes.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 p-3 text-sm">
              <span className="flex min-w-0 items-center gap-2"><FileText size={16} aria-hidden="true" /><span className="truncate">{r.fileName || `Resume v${r.version}`}</span></span>
              {r.fileUrl && (
                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700">
                  <Download size={15} aria-hidden="true" /> Download
                </a>
              )}
            </div>
          ))}
        </Section>
      )}

      {(data.application?.coverLetter || data.application?.coverLetterFile?.fileUrl) && (
        <Section title="Cover letter">
          {data.application.coverLetter && <p className="whitespace-pre-line rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">{data.application.coverLetter}</p>}
          {data.application.coverLetterFile?.fileUrl && (
            <a href={data.application.coverLetterFile.fileUrl} download className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              <Download size={15} aria-hidden="true" /> {data.application.coverLetterFile.fileName || 'Download file'}
            </a>
          )}
        </Section>
      )}
    </div>
  );
}
