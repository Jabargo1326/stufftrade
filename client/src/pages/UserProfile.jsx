import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';
import { PlusIcon } from '../components/Icons.jsx';
import { memberYear } from '../format.js';

// A PUBLIC profile: what other people can see about someone (no email / mobile number).
export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setData(null);
    api.user(id).then(setData).catch(() => setMissing(true));
  }, [id]);

  const toggleSave = async (post) => {
    try {
      const { saved } = await api.toggleSave(post.id);
      setData((d) => ({ ...d, posts: d.posts.map((p) => (p.id === post.id ? { ...p, is_saved: saved } : p)) }));
      toast(saved ? 'Saved to your list' : 'Removed from saved');
    } catch (e) { toast(e.message); }
  };

  if (missing) return <Screen title="Profile" back nav="browse"><p className="muted center pad">This profile doesn't exist.</p></Screen>;
  if (!data) return <Screen title="Profile" back nav="browse"><p className="muted center pad">Loading…</p></Screen>;

  const u = data.user;
  const isMe = u.id === me.id;

  return (
    <Screen title="Profile" back nav={isMe ? 'profile' : 'browse'}>
      <div className="public-head">
        <Avatar src={u.photo} name={u.name} size={88} />
        <h2>{u.name}</h2>
        <p className="muted small">{u.area} · Member since {memberYear(u.created_at)}</p>
        {isMe && <p className="muted small">This is how other people see you.</p>}
      </div>

      <div className="stat-row">
        <div className="card stat"><strong>{u.completed_trades}</strong><span className="muted small">Completed trades</span></div>
        <div className="card stat"><strong>{u.open_posts}</strong><span className="muted small">Open posts</span></div>
      </div>

      {isMe && <Link to="/profile/edit" className="btn btn-outline" style={{ marginTop: 12 }}>Edit profile</Link>}

      <div className="section-head"><h2>{isMe ? 'Your open posts' : `${u.name.split(' ')[0]}'s open posts`}</h2></div>
      {data.posts.length === 0 ? (
        <EmptyState icon={<PlusIcon width={56} height={56} />} title="No open posts" text="Nothing to trade right now" />
      ) : (
        <div className="grid">
          {data.posts.map((p) => <PostCard key={p.id} post={p} mine={p.user_id === me.id} onToggleSave={toggleSave} />)}
        </div>
      )}
    </Screen>
  );
}
