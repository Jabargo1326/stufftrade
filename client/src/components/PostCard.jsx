import { Link } from 'react-router-dom';
import PostImage from './PostImage.jsx';
import { HeartIcon } from './Icons.jsx';
import { offerCount } from '../format.js';

export default function PostCard({ post, onToggleSave }) {
  return (
    <Link to={`/post/${post.id}`} className="card post-card">
      <div className="post-card-media">
        <PostImage photos={post.photos} category={post.category} alt={post.title} />
        <button
          className={`heart ${post.is_saved ? 'on' : ''}`}
          aria-label={post.is_saved ? 'Remove from saved' : 'Save post'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave?.(post); }}
        >
          <HeartIcon filled={post.is_saved} width={18} height={18} />
        </button>
      </div>
      <div className="post-card-body">
        <h3 className="post-card-title">{post.title}</h3>
        <p className="muted small ellipsis">Wants: {post.wants}</p>
        <p className="post-card-foot">{offerCount(post.offers_count)} · {post.area}</p>
      </div>
    </Link>
  );
}
