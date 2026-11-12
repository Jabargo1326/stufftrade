import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { Field } from '../components/Screen.jsx';
import Avatar from '../components/Avatar.jsx';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInput = useRef(null);
  const [f, setF] = useState({ name: user.name, mobile: user.mobile, area: user.area });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    if (file) form.append('photo', file);
    setBusy(true);
    try {
      const { user: updated } = await api.updateProfile(form);
      setUser(updated);
      toast('Profile updated');
      navigate('/profile');
    } catch (err) {
      if (Object.keys(err.fields || {}).length) setErrors(err.fields);
      else toast(err.message);
    } finally { setBusy(false); }
  };

  return (
    <Screen title="Edit profile" back="/profile" nav="profile">
      <form className="form-wide" onSubmit={submit} noValidate>
        <div className="center">
          {preview ? <span className="avatar" style={{ width: 84, height: 84 }}><img src={preview} alt="" /></span> : <Avatar src={user.photo} name={user.name} size={84} />}
          <div><button type="button" className="link-btn" onClick={() => fileInput.current?.click()}>Change photo</button></div>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={pick} />
        </div>
        <Field label="Full name" error={errors.name}><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Mobile number" error={errors.mobile}><input className="input" type="tel" value={f.mobile} onChange={set('mobile')} /></Field>
        <Field label="Area" error={errors.area}><input className="input" value={f.area} onChange={set('area')} /></Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </Screen>
  );
}
