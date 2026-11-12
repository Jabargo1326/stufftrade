import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import PostCard from '../components/PostCard.jsx';
import { HeartIcon } from '../components/Icons.jsx';

export default function Saved() {
  const [posts, setPosts] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.savedPosts().then((d) => setPosts(d.posts)).catch((e) => { setPosts([]); toast(e.message); });
  }, [toast]);

  const unsave = async (post) => {
    try {
      await api.toggleSave(post.id);
      setPosts((list) => list.filter((p) => p.id !== post.id));
      toast('Removed from saved');
    } catch (e) { toast(e.message); }
  };

  return (
    <Screen title="Saved posts" back="/profile" nav="profile">
      {posts === null ? <p className="muted center">Loading…</p> : posts.length === 0 ? (
        <EmptyState icon={<HeartIcon width={56} height={56} />} title="Nothing saved yet" text="Tap the heart on a post to keep it here">
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse trade posts</button>
        </EmptyState>
      ) : (
        <div className="grid">{posts.map((p) => <PostCard key={p.id} post={p} onToggleSave={unsave} />)}</div>
      )}
    </Screen>
  );
}
