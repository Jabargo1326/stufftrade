import { imgUrl } from '../api.js';
import { UserIcon } from './Icons.jsx';

export default function Avatar({ src, size = 40, name = '' }) {
  const url = imgUrl(src);
  return (
    <span className="avatar" style={{ width: size, height: size }} title={name}>
      {url ? <img src={url} alt={name} /> : <UserIcon width={size * 0.55} height={size * 0.55} />}
    </span>
  );
}
