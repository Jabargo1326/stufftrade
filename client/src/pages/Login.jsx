import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Screen, { Field } from '../components/Screen.jsx';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      const { token, user } = await api.login({ identifier, password });
      signIn(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      else toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Log In" tone="maroon">
      <div className="auth-sheet">
        <form onSubmit={submit} noValidate>
          <h2 className="sheet-title">Welcome back</h2>
          <Field label="Email or mobile number" error={errors.identifier}>
            <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="example@example.com" autoComplete="username" />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
          </Field>
          <div className="right">
            <button type="button" className="link-btn" onClick={() => toast('Password reset is not available yet.')}>Forgot password?</button>
          </div>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Log In'}</button>
          <p className="center muted small">No account yet? <Link to="/signup">Sign up</Link></p>
        </form>
      </div>
    </Screen>
  );
}
