import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import Modal from '../components/Modal.jsx';
import PostCard from '../components/PostCard.jsx';
import { SearchIcon } from '../components/Icons.jsx';

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState(null); // null = still loading
  const [pickCategory, setPickCategory] = useState(false);

  useEffect(() => {
    api.categories().then((d) => setCategories(['All', ...d.categories])).catch(() => {});
  }, []);

  // search as you type (waits 300ms after you stop typing)
  useEffect(() => {
    const t = setTimeout(() => {
      api.posts({ q, category }).then((d) => setPosts(d.posts)).catch((e) => { setPosts([]); toast(e.message); });
    }, 300);
    return () => clearTimeout(t);
  }, [q, category, toast]);

  const toggleSave = async (post) => {
    setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, is_saved: !p.is_saved } : p)));
    try {
      const { saved } = await api.toggleSave(post.id);
      toast(saved ? 'Saved to your list' : 'Removed from saved');
    } catch (e) {
      setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, is_saved: post.is_saved } : p)));
      toast(e.message);
    }
  };

  const searching = q.trim().length > 0;
  const header = (
    <>
      <h1 className="hello">Hello, {user.name.split(' ')[0]}</h1>
      <div className="searchbar">
        <SearchIcon width={20} height={20} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trade posts" aria-label="Search trade posts" />
        {searching && <button className="clear" onClick={() => setQ('')}>Clear</button>}
      </div>
    </>
  );

  return (
    <Screen header={header} nav="browse">
      <div className="chips" role="tablist" aria-label="Categories">
        {categories.map((c) => (
          <button key={c} className={`chip ${c === category ? 'on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="section-head">
        {searching ? <h2>{posts ? `${posts.length} result${posts.length === 1 ? '' : 's'}` : 'Searching…'}</h2> : <h2>Trades near you</h2>}
        {!searching && <button className="link-btn" onClick={() => setPickCategory(true)}>Categories</button>}
      </div>

      {posts === null ? (
        <p className="muted center">Loading…</p>
      ) : posts.length === 0 ? (
        <EmptyState icon={<SearchIcon width={56} height={56} />} title="No trade posts found" text="Try another word or category" />
      ) : (
        <div className="grid">
          {posts.map((p) => <PostCard key={p.id} post={p} onToggleSave={toggleSave} />)}
        </div>
      )}

      <Modal open={pickCategory} onClose={() => setPickCategory(false)} variant="sheet">
        <h3 className="dialog-title left">Categories</h3>
        <div className="list-plain">
          {categories.map((c) => (
            <button key={c} className={`list-btn ${c === category ? 'on' : ''}`} onClick={() => { setCategory(c); setPickCategory(false); }}>{c}</button>
          ))}
        </div>
      </Modal>
    </Screen>
  );
}
