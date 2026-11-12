import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import PostImage from '../components/PostImage.jsx';
import { offerCount } from '../format.js';
import { PlusIcon } from '../components/Icons.jsx';

export default function MyPosts() {
  const [posts, setPosts] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const toast = useToast();

  useEffect(() => {
    api.myPosts().then((d) => setPosts(d.posts)).catch((e) => { setPosts([]); toast(e.message); });
  }, [toast]);

  // show "Post deleted" / "Changes saved" passed from the previous screen
  useEffect(() => {
    if (state?.toast) { toast(state.toast); navigate('/my-posts', { replace: true, state: null }); }
  }, [state, toast, navigate]);

  return (
    <Screen title="My posts" back="/profile" nav="profile">
      {posts === null ? <p className="muted center">Loading…</p> : posts.length === 0 ? (
        <EmptyState icon={<PlusIcon width={56} height={56} />} title="No posts yet" text="Post something you want to trade" />
      ) : (
        <div className="list">
          {posts.map((p) => (
            <Link key={p.id} to={`/post/${p.id}`} className="card list-row">
              <PostImage className="thumb" photos={p.photos} category={p.category} alt="" />
              <div className="grow">
                <strong>{p.title}</strong>
                <p className="muted small">{p.category} · {p.status === 'traded' ? 'Traded' : offerCount(p.offers_count).toLowerCase()}</p>
              </div>
              <span className={`badge ${p.status === 'traded' ? 'grey' : 'green'}`}>{p.status === 'traded' ? 'Traded' : 'Open'}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="bottom-cta">
        <button className="btn btn-primary" onClick={() => navigate('/create')}>Create post</button>
      </div>
    </Screen>
  );
}
