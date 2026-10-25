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

  const create = async (payload) => {
    await internshipAPI.create(payload);
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
