// frontend/src/pages/EditInternshipPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const EditInternshipPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: { description: '' },
    location: { type: 'remote', city: '', country: '' },
    compensation: {
      type: 'paid',
      amount: { min: '', max: '', currency: 'USD', period: 'monthly' },
      benefits: []
    },
    duration: { length: '', hoursPerWeek: { min: 20, max: 40 }, flexible: false },
    timeline: { startDate: '', endDate: '', applicationDeadline: '' },
    positions: { total: 1 },
    status: 'draft'
  });

  useEffect(() => {
    fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      const response = await internshipAPI.getById(id);
      if (response.data.success) {
        const internship = response.data.data;
        // Format dates for input fields
        const formatDate = (date) => {
          if (!date) return '';
          return new Date(date).toISOString().split('T')[0];
        };

        setFormData({
          title: internship.title || '',
          description: internship.description || '',
          requirements: {
            description: internship.requirements?.description || ''
          },
          location: {
            type: internship.location?.type || 'remote',
            city: internship.location?.city || '',
            country: internship.location?.country || ''
          },
          compensation: {
            type: internship.compensation?.type || 'paid',
            amount: {
              min: internship.compensation?.amount?.min || '',
              max: internship.compensation?.amount?.max || '',
              currency: internship.compensation?.amount?.currency || 'USD',
              period: internship.compensation?.amount?.period || 'monthly'
            },
            benefits: internship.compensation?.benefits || []
          },
          duration: {
            length: internship.duration?.length || '',
            hoursPerWeek: {
              min: internship.duration?.hoursPerWeek?.min || 20,
              max: internship.duration?.hoursPerWeek?.max || 40
            },
            flexible: internship.duration?.flexible || false
          },
          timeline: {
            startDate: formatDate(internship.timeline?.startDate),
            endDate: formatDate(internship.timeline?.endDate),
            applicationDeadline: formatDate(internship.timeline?.applicationDeadline)
          },
          positions: {
            total: internship.positions?.total || 1
          },
          status: internship.status || 'draft'
        });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load internship');
      navigate('/dashboard/my-internships');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: {
              ...prev[keys[0]][keys[1]],
              [keys[2]]: value
            }
          }
        };
      }
      return prev;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description || formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    if (formData.location.type !== 'remote' && !formData.location.city) newErrors['location.city'] = 'City is required for on-site/hybrid';
    if (!formData.duration.length) newErrors['duration.length'] = 'Duration is required';
    if (!formData.timeline.startDate) newErrors['timeline.startDate'] = 'Start date is required';
    if (!formData.timeline.applicationDeadline) newErrors['timeline.applicationDeadline'] = 'Application deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const response = await internshipAPI.update(id, formData);
      if (response.data.success) {
        navigate('/dashboard/my-internships');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(e => {
          apiErrors[e.field] = e.message;
        });
        setErrors(apiErrors);
      } else {
        alert(err.response?.data?.error || 'Failed to update internship');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard/my-internships')}
          className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to My Internships
        </button>

        <h1 className="text-3xl font-semibold text-neutral-900 mb-8">Edit Internship</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-8">
          {/* Basic Info */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Basic Information</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Internship Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.title ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="e.g., Software Engineering Intern"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description * (minimum 50 characters)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Describe the internship, responsibilities, and what the intern will learn..."
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                <p className="text-neutral-500 text-sm ml-auto">{formData.description.length} characters</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Requirements
              </label>
              <textarea
                value={formData.requirements.description}
                onChange={(e) => handleChange('requirements.description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="List required skills, education level, experience, etc..."
              />
            </div>
          </section>

          {/* Location */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
                <select
                  value={formData.location.type}
                  onChange={(e) => handleChange('location.type', e.target.value)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {formData.location.type !== 'remote' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) => handleChange('location.city', e.target.value)}
                      className={`w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors['location.city'] ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="San Francisco"
                    />
                    {errors['location.city'] && <p className="text-red-600 text-sm mt-1">{errors['location.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) => handleChange('location.country', e.target.value)}
                      className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="USA"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Duration */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Duration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Duration Length *</label>
                <input
                  type="text"
                  value={formData.duration.length}
                  onChange={(e) => handleChange('duration.length', e.target.value)}
                  className={`w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors['duration.length'] ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="e.g., 3 months, Summer 2025"
                />
                {errors['duration.length'] && <p className="text-red-600 text-sm mt-1">{errors['duration.length']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Positions Available</label>
                <input
                  type="number"
                  min="1"
                  value={formData.positions.total}
                  onChange={(e) => handleChange('positions.total', parseInt(e.target.value) || 1)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Compensation</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
                <select
                  value={formData.compensation.type}
                  onChange={(e) => handleChange('compensation.type', e.target.value)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="stipend">Stipend</option>
                </select>
              </div>

              {formData.compensation.type === 'paid' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Min Amount (monthly)</label>
                    <input
                      type="number"
                      value={formData.compensation.amount.min}
                      onChange={(e) => handleChange('compensation.amount.min', e.target.value)}
                      className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Max Amount (monthly)</label>
                    <input
                      type="number"
                      value={formData.compensation.amount.max}
                      onChange={(e) => handleChange('compensation.amount.max', e.target.value)}
                      className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="3000"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Timeline</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={(e) => handleChange('timeline.startDate', e.target.value)}
                  className={`w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors['timeline.startDate'] ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                {errors['timeline.startDate'] && <p className="text-red-600 text-sm mt-1">{errors['timeline.startDate']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={(e) => handleChange('timeline.endDate', e.target.value)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Application Deadline *</label>
                <input
                  type="date"
                  value={formData.timeline.applicationDeadline}
                  onChange={(e) => handleChange('timeline.applicationDeadline', e.target.value)}
                  className={`w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors['timeline.applicationDeadline'] ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                {errors['timeline.applicationDeadline'] && <p className="text-red-600 text-sm mt-1">{errors['timeline.applicationDeadline']}</p>}
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Internship Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/my-internships')}
              className="flex-1 h-12 px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInternshipPage;