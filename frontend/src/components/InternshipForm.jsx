import { useState } from 'react';
import Alert from './Alert';
import Button from './Button';
import { OPPORTUNITY_TYPES } from '../utils/opportunity';
import { toFormValues, toPayload, validateValues } from '../utils/internshipForm';

const field =
  'w-full rounded-md border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-400 focus:outline-none focus:ring-4';
const ok = 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30';
const bad = 'border-error-500 focus:border-error-500 focus:ring-error-500/20';

function Field({ id, label, hint, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-error-600" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-error-700" role="alert">{error}</p>}
    </div>
  );
}

const Group = ({ title, children }) => (
  <fieldset className="space-y-4 border-t border-neutral-200 pt-6 first:border-0 first:pt-0">
    <legend className="mb-1 text-base font-semibold text-neutral-900">{title}</legend>
    {children}
  </fieldset>
);

/**
 * Create / edit form for an internship listing.
 * `onSubmit(payload)` should throw (axios error) on failure; field errors from
 * the API are shown inline.
 */
export default function InternshipForm({ initial, onSubmit, onCancel, isEdit = false, hidePublish = false }) {
  const [v, setV] = useState(() => toFormValues(initial));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const props = (id, k = id) => ({
    id,
    value: v[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${id}-err` : `${id}-hint`,
  });
  const cls = (k) => `${field} ${errors[k] ? bad : ok} h-11`;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setApiError('');
    const found = validateValues(v);
    setErrors(found);
    if (Object.keys(found).length) {
      setApiError('Please fix the highlighted fields.');
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(toPayload(v));
    } catch (err) {
      const list = err.response?.data?.errors;
      if (Array.isArray(list) && list.length) {
        setApiError(list.map((x) => x.message).join(' '));
      } else {
        setApiError(err.response?.data?.error || err.response?.data?.message || 'We could not save this listing. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
      {apiError && <Alert variant="error">{apiError}</Alert>}

      <Group title="The role">
        <Field id="opportunityType" label="Type of opportunity" required>
          <select {...props('opportunityType')} className={cls('opportunityType')}>
            {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field id="title" label="Title" required error={errors.title}>
          <input type="text" {...props('title')} placeholder="e.g. Frontend Developer" className={`${cls('title')}`} />
        </Field>
        <Field id="description" label="Description" required error={errors.description} hint={`${v.description.trim().length} / 5,000 characters (minimum 50)`}>
          <textarea {...props('description')} rows={6} className={`${field} ${errors.description ? bad : ok} py-2`} placeholder="What will the intern work on, and what will they learn?" />
        </Field>
        <Field id="requirementsText" label="Requirements" error={errors.requirementsText}>
          <textarea {...props('requirementsText')} rows={3} className={`${field} ${errors.requirementsText ? bad : ok} py-2`} placeholder="Education, experience or anything else applicants should know." />
        </Field>
        <Field id="skillsText" label="Skills" hint="Separate with commas, e.g. React, SQL. Students can filter listings by these.">
          <input type="text" {...props('skillsText')} className={cls('skillsText')} />
        </Field>
      </Group>

      <Group title="Where and how">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="locationType" label="Work arrangement" required>
            <select {...props('locationType')} className={cls('locationType')}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </Field>
          <Field id="city" label="City" required={v.locationType !== 'remote'} error={errors.city}>
            <input type="text" {...props('city')} className={cls('city')} />
          </Field>
          <Field id="country" label="Country">
            <input type="text" {...props('country')} className={cls('country')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="durationLength" label="Duration" required error={errors.durationLength}>
            <input type="text" {...props('durationLength')} placeholder="e.g. 3 months, Permanent" className={cls('durationLength')} />
          </Field>
          <Field id="positions" label="Open positions">
            <input type="number" min="1" {...props('positions')} className={cls('positions')} />
          </Field>
        </div>
      </Group>

      <Group title="Compensation">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field id="compType" label="Type" required>
            <select {...props('compType')} className={cls('compType')}>
              <option value="paid">Paid</option>
              <option value="stipend">Stipend</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </Field>
          {v.compType === 'paid' && (
            <>
              <Field id="currency" label="Currency">
                <select {...props('currency')} className={cls('currency')}>
                  {['USD', 'NGN', 'GBP', 'EUR', 'CAD', 'GHS', 'KES', 'ZAR'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="min" label="Minimum / month" error={errors.min}>
                <input type="number" min="0" inputMode="numeric" {...props('min')} className={cls('min')} />
              </Field>
              <Field id="max" label="Maximum / month" error={errors.max}>
                <input type="number" min="0" inputMode="numeric" {...props('max')} className={cls('max')} />
              </Field>
            </>
          )}
        </div>
      </Group>

      <Group title="Dates">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="deadline" label="Application deadline" required error={errors.deadline}>
            <input type="date" {...props('deadline')} className={cls('deadline')} />
          </Field>
          <Field id="startDate" label="Start date" required error={errors.startDate}>
            <input type="date" {...props('startDate')} className={cls('startDate')} />
          </Field>
          <Field id="endDate" label="End date" error={errors.endDate}>
            <input type="date" {...props('endDate')} className={cls('endDate')} />
          </Field>
        </div>
      </Group>

      {!hidePublish && (
      <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <input id="publish" type="checkbox" checked={v.publish} onChange={set('publish')} className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
        <label htmlFor="publish" className="text-sm">
          <span className="font-medium text-neutral-900">{isEdit ? 'Listing is open for applications' : 'Publish now'}</span>
          <span className="block text-neutral-600">
            {v.publish ? 'Students can see and apply to this listing.' : 'Saved as a draft. Only you can see it until you publish.'}
          </span>
        </label>
      </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" loading={busy}>{isEdit ? 'Save changes' : v.publish ? 'Publish internship' : 'Save draft'}</Button>
      </div>
    </form>
  );
}
