import { useEffect, useState } from 'react';
import { imgUrl } from '../api.js';
import { CATEGORY_EMOJI } from '../format.js';

// Shows the first photo, or a coloured emoji tile when the post has no photo
// (or the photo file is missing / fails to load).
export default function PostImage({ photos = [], category = 'Other', className = '', alt = '' }) {
  const src = imgUrl(photos[0]);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return <img className={`post-img ${className}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <div className={`post-img placeholder ${className}`} role="img" aria-label={alt}>
      <span>{CATEGORY_EMOJI[category] || '📦'}</span>
    </div>
  );
}
