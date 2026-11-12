import { useRef } from 'react';
import { PlusIcon, CloseIcon } from './Icons.jsx';
import { imgUrl } from '../api.js';

// value = array of { key, src, file?, url? }
//   - new photo from the phone:  { file, src: blobUrl }
//   - photo already on the server (edit screen): { url, src }
export default function PhotoPicker({ value, onChange, max = 3 }) {
  const input = useRef(null);

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, max - value.length);
    const added = files.map((file) => ({ key: crypto.randomUUID?.() || String(Math.random()), file, src: URL.createObjectURL(file) }));
    onChange([...value, ...added]);
    e.target.value = '';
  };
  const remove = (key) => onChange(value.filter((p) => p.key !== key));

  const slots = Array.from({ length: max }, (_, i) => value[i] || null);
  return (
    <div>
      <div className="photo-row">
        {slots.map((p, i) =>
          p ? (
            <div className="photo-slot filled" key={p.key}>
              <img src={p.file ? p.src : imgUrl(p.src)} alt="" />
              <button type="button" className="photo-remove" onClick={() => remove(p.key)} aria-label="Remove photo"><CloseIcon width={14} height={14} /></button>
            </div>
          ) : i === value.length ? (
            <button type="button" className="photo-slot add" key={`add${i}`} onClick={() => input.current?.click()} aria-label="Add photo">
              <PlusIcon />
            </button>
          ) : (
            <div className="photo-slot" key={`empty${i}`} />
          )
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={addFiles} />
      <p className="muted small">Add up to {max} photos</p>
    </div>
  );
}
