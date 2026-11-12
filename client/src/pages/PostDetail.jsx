import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen from '../components/Screen.jsx';
import Modal, { ConfirmDialog } from '../components/Modal.jsx';
import PostImage from '../components/PostImage.jsx';
import Avatar from '../components/Avatar.jsx';
import PhotoPicker from '../components/PhotoPicker.jsx';
import { ChevronLeft, HeartIcon } from '../components/Icons.jsx';
import { timeAgo } from '../format.js';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.post(id).then((d) => setPost(d.post)).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <Screen title="Post" back="/"><p className="muted center pad">This post no longer exists.</p></Screen>;
  if (!post) return <Screen><p className="muted center pad">Loading…</p></Screen>;

  const mine = post.user_id === user.id;
  const traded = post.status === 'traded';

  const toggleSave = async () => {
    try {
      const { saved } = await api.toggleSave(post.id);
      setPost({ ...post, is_saved: saved });
      toast(saved ? 'Saved to your list' : 'Removed from saved');
    } catch (e) { toast(e.message); }
  };

  const remove = async () => {
    try {
      await api.deletePost(post.id);
      navigate('/my-posts', { replace: true, state: { toast: 'Post deleted' } });
    } catch (e) { toast(e.message); setConfirmDelete(false); }
  };

  return (
    <Screen nav={mine ? 'profile' : 'browse'} className="detail-wrap">
      <div className="detail">
        <div className="detail-media">
          <PostImage photos={post.photos} category={post.category} alt={post.title} />
          <button className="round-btn left" onClick={() => navigate(-1)} aria-label="Back"><ChevronLeft /></button>
          {!mine && (
            <button className={`round-btn right ${post.is_saved ? 'on' : ''}`} onClick={toggleSave} aria-label="Save post">
              <HeartIcon filled={post.is_saved} />
            </button>
          )}
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{post.title}</h1>
          <p className="muted small">
            {post.category} · {mine ? 'Posted by you · ' : ''}{post.area}{!mine && ` · ${timeAgo(post.created_at)}`}
            {traded && ' · Traded'}
          </p>

          {!mine && (
            <div className="owner">
              <Avatar src={post.owner_photo} name={post.owner_name} size={36} />
              <div>
                <strong>{post.owner_name}</strong>
                <p className="muted small">{post.owner_trades} completed trade{post.owner_trades === 1 ? '' : 's'}</p>
              </div>
            </div>
          )}

          {post.description && <p className="detail-desc">{post.description}</p>}

          <div className="card info-card">
            <span className="muted small">Wants in return</span>
            <strong>{post.wants}</strong>
          </div>

          {mine ? (
            <>
              <Link to={`/post/${post.id}/offers`} className="card info-card row-between">
                <strong>{post.offers_count} offer{post.offers_count === 1 ? '' : 's'} received</strong>
                <span className="link">View</span>
              </Link>
              {!traded && (
                <div className="row gap actions">
                  <button className="btn btn-outline" onClick={() => navigate(`/post/${post.id}/edit`)}>Edit</button>
                  <button className="btn btn-outline-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="muted small">{post.offers_count === 0 ? 'No offers yet' : `${post.offers_count} offer${post.offers_count === 1 ? '' : 's'} so far`}</p>
              <div className="actions">
                <button className="btn btn-primary" onClick={() => setOfferOpen(true)} disabled={traded}>
                  {traded ? 'Already traded' : 'Make an offer'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <OfferSheet open={offerOpen} onClose={() => setOfferOpen(false)} post={post} onSent={() => navigate('/done/offer-sent', { state: { name: post.owner_name.split(' ')[0] } })} />

      <ConfirmDialog open={confirmDelete} title="Delete this post?" text="This cannot be undone." confirmLabel="Delete" danger onCancel={() => setConfirmDelete(false)} onConfirm={remove} />
    </Screen>
  );
}

function OfferSheet({ open, onClose, post, onSent }) {
  const toast = useToast();
  const [item, setItem] = useState('');
  const [cash, setCash] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setError('');
    if (!item.trim() && !(parseInt(cash, 10) > 0)) return setError('Offer an item, some cash, or both.');
    const form = new FormData();
    form.append('item', item);
    form.append('cash', cash || '0');
    form.append('message', message);
    photos.forEach((p) => p.file && form.append('photos', p.file));
    setBusy(true);
    try {
      await api.sendOffer(post.id, form);
      onSent();
    } catch (e) {
      setError(e.message);
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} variant="sheet">
      <h3 className="dialog-title left">Make an offer</h3>
      <p className="muted small tight">{post.title} · {post.owner_name}</p>
      <div className="stack">
        <label className="field"><span className="label">What are you offering?</span>
          <input className="input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Old keyboard, barely used" />
        </label>
        <label className="field"><span className="label">Add cash (optional)</span>
          <input className="input" type="number" inputMode="numeric" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
        </label>
        <div className="field"><span className="label">Photos of your item</span>
          <PhotoPicker value={photos} onChange={setPhotos} />
        </div>
        <label className="field"><span className="label">Message (optional)</span>
          <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Can meet at the plaza on Saturday" />
        </label>
        {error && <p className="error-text">{error}</p>}
      </div>
      <div className="row gap">
        <button className="btn btn-soft" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send offer'}</button>
      </div>
    </Modal>
  );
}
