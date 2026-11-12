import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { Field } from '../components/Screen.jsx';

export default function Signup() {
  const [f, setF] = useState({ name: '', email: '', mobile: '', area: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      const { token, user } = await api.signup(f);
      signIn(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      if (Object.keys(err.fields || {}).length) setErrors(err.fields);
      else toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="New Account" back="/login" tone="maroon">
      <div className="auth-sheet">
        <form onSubmit={submit} noValidate>
          <Field label="Full name" error={errors.name}>
            <input className="input" value={f.name} onChange={set('name')} placeholder="Juan Dela Cruz" autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="input" type="email" value={f.email} onChange={set('email')} placeholder="example@example.com" autoComplete="email" />
          </Field>
          <Field label="Mobile number" error={errors.mobile}>
            <input className="input" type="tel" value={f.mobile} onChange={set('mobile')} placeholder="+63 900 000 0000" autoComplete="tel" />
          </Field>
          <Field label="Area" error={errors.area}>
            <input className="input" value={f.area} onChange={set('area')} placeholder="Neighborhood or barangay" />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" value={f.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <input className="input" type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </Field>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
      </div>
    </Screen>
  );
}
