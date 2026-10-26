import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import Button from './Button';

const FLYER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const FLYER_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Optional flyer image for a listing. Shows the current flyer (edit) or a
 * preview of the newly chosen file, and lets the employer replace or remove it.
 */
export default function FlyerPicker({ existingUrl, file, removed, onPick, onRemove, onUndoRemove }) {
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    setError('');
    if (!f) return;
    if (!FLYER_TYPES.includes(f.type)) {
      setError('Use a JPG, PNG or WebP image.');
      return;
    }
    if (f.size > FLYER_MAX_BYTES) {
      setError('That image is over 5 MB. Please choose a smaller one.');
      return;
    }
    onPick(f);
  };

  const shown = preview || (!removed ? existingUrl : null);

  return (
    <div>
      <input ref={inputRef} id="flyer" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} className="sr-only" aria-describedby="flyer-hint" />
      {shown ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img src={shown} alt="Flyer preview" className="max-h-72 w-full rounded-lg border border-neutral-200 object-contain sm:w-56" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>Replace image</Button>
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} icon={<Trash2 size={15} aria-hidden="true" />}>Remove</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} icon={<ImagePlus size={16} aria-hidden="true" />}>
            Add a flyer
          </Button>
          {removed && existingUrl && (
            <button type="button" onClick={onUndoRemove} className="rounded text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              Keep the current flyer
            </button>
          )}
        </div>
      )}
      <p id="flyer-hint" className="mt-2 text-xs text-neutral-500">Optional. JPG, PNG or WebP, up to 5 MB. Students see it on the listing page.</p>
      {error && <p className="mt-1.5 text-sm text-error-700" role="alert">{error}</p>}
    </div>
  );
}
