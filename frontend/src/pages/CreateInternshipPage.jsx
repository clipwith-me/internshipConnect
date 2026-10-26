import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import InternshipForm from '../components/InternshipForm';

export default function CreateInternshipPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Post an opportunity | InternshipConnect';
  }, []);

  const create = async (payload, { flyerFile }) => {
    const res = await internshipAPI.create(payload);
    if (flyerFile) {
      try {
        await internshipAPI.uploadFlyer(res.data?.data?._id, flyerFile);
      } catch (err) {
        // The listing exists; send them to edit so they can retry the flyer.
        navigate(`/dashboard/internships/${res.data?.data?._id}/edit`, {
          state: { notice: `Your listing was saved, but the flyer didn't upload: ${err.response?.data?.error || 'please try again.'}` },
        });
        return;
      }
    }
    navigate('/dashboard/my-internships');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        backTo="/dashboard/my-internships"
        backLabel="My listings"
        title="Post an opportunity"
        description="Clear titles, honest pay and a real deadline get better applicants."
      />
      <InternshipForm onSubmit={create} onCancel={() => navigate('/dashboard/my-internships')} />
    </div>
  );
}
