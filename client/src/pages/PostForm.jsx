import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { Field } from '../components/Screen.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import PhotoPicker from '../components/PhotoPicker.jsx';
import { ChevronDown } from '../components/Icons.jsx';

// One form used for both "Create post" and "Edit post".
export default function PostForm({ mode }) {
  const editing = mode === 'edit';
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [f, setF] = useState({ title: '', category: '', description: '', wants: '', area: editing ? '' : user.area });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { api.categories().then((d) => setCategories(d.categories)); }, []);

  useEffect(() => {
    if (!editing) return;
    api.post(id).then(({ post }) => {
      if (post.user_id !== user.id) return navigate('/', { replace: true });
      setF({ title: post.title, category: post.category, description: post.description, wants: post.wants, area: post.area });
      setPhotos(post.photos.map((u) => ({ key: u, src: u, url: u })));
    }).catch(() => navigate('/my-posts', { replace: true })).finally(() => setLoading(false));
  }, [editing, id, user.id, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    photos.forEach((p) => p.file && form.append('photos', p.file));
    if (editing) form.append('keep', JSON.stringify(photos.filter((p) => p.url).map((p) => p.url)));
    setBusy(true);
    try {
      if (editing) {
        await api.updatePost(id, form);
        navigate('/my-posts', { replace: true, state: { toast: 'Changes saved' } });
      } else {
        await api.createPost(form);
        navigate('/done/published', { replace: true });
      }
    } catch (err) {
      if (Object.keys(err.fields || {}).length) setErrors(err.fields);
      else toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.deletePost(id);
      navigate('/my-posts', { replace: true, state: { toast: 'Post deleted' } });
    } catch (err) { toast(err.message); setConfirmDelete(false); }
  };

  return (
    <Screen title={editing ? 'Edit post' : 'Create post'} back={editing} nav={editing ? 'profile' : 'post'}>
      {loading ? <p className="muted center">Loading…</p> : (
        <form className="form-wide" onSubmit={submit} noValidate>
          <PhotoPicker value={photos} onChange={setPhotos} />
          <Field label="Title" error={errors.title}>
            <input className="input" value={f.title} onChange={set('title')} placeholder="What are you trading?" maxLength={80} />
          </Field>
          <Field label="Category" error={errors.category}>
            <span className="select-wrap">
              <select className="input" value={f.category} onChange={set('category')}>
                <option value="" disabled>Select a category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown width={20} height={20} />
            </span>
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea className="input" rows={3} value={f.description} onChange={set('description')} placeholder="Condition, size, details" maxLength={500} />
          </Field>
          <Field label="Looking for in return" error={errors.wants}>
            <input className="input" value={f.wants} onChange={set('wants')} placeholder="What do you want in exchange?" maxLength={120} />
          </Field>
          <Field label="Area" error={errors.area}>
            <input className="input" value={f.area} onChange={set('area')} placeholder="Neighborhood or barangay" />
          </Field>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}</button>
          {editing && <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmDelete(true)}>Delete post</button>}
        </form>
      )}
      <ConfirmDialog open={confirmDelete} title="Delete this post?" text="This cannot be undone." confirmLabel="Delete" danger onCancel={() => setConfirmDelete(false)} onConfirm={remove} />
    </Screen>
  );
}
