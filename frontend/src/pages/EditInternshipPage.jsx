import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { Alert, Button, EmptyState } from '../components';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import InternshipForm from '../components/InternshipForm';

export default function EditInternshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    document.title = 'Edit internship | InternshipConnect';
    const controller = new AbortController();
    internshipAPI
      .getById(id, { signal: controller.signal })
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', data: null });
      });
    return () => controller.abort();
  }, [id]);

  if (state.status === 'loading') {
    return <div className="mx-auto max-w-3xl h-96 animate-pulse rounded-xl bg-neutral-200" aria-busy="true" />;
  }
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          asPage
          title="We couldn't load this listing"
          description="It may have been removed, or you may not own it."
          action={<Button as={Link} to="/dashboard/my-internships" variant="secondary">Back to my internships</Button>}
        />
      </div>
    );
  }

  const current = state.data;
  // The "open" switch only makes sense for drafts and open listings; paused,
  // closed and filled listings keep their status when edited.
  const toggleable = ['draft', 'active'].includes(current.status);

  const save = async (payload, { flyerFile, removeFlyer }) => {
    const { publish, ...rest } = payload;
    await internshipAPI.update(id, toggleable ? { ...rest, status: publish ? 'active' : 'draft' } : rest);
    try {
      if (flyerFile) await internshipAPI.uploadFlyer(id, flyerFile);
      else if (removeFlyer) await internshipAPI.deleteFlyer(id);
    } catch (err) {
      const msg = err.response?.data?.error || 'please try again.';
      // Surface through the form's error banner; the listing changes are already saved.
      throw Object.assign(new Error(msg), {
        response: { data: { error: `Your changes were saved, but the flyer didn't update: ${msg}` } },
      });
    }
    navigate('/dashboard/my-internships');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        backTo="/dashboard/my-internships"
        backLabel="My listings"
        title="Edit listing"
        description={<StatusBadge kind="internship" status={current.status} />}
      />
      {location.state?.notice && <Alert variant="warning" className="mb-5">{location.state.notice}</Alert>}
      <InternshipForm
        isEdit
        initial={current}
        hidePublish={!toggleable}
        onSubmit={save}
        onCancel={() => navigate('/dashboard/my-internships')}
      />
    </div>
  );
}
