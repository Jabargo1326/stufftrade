import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Screen from '../components/Screen.jsx';
import Avatar from '../components/Avatar.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { ChevronRight } from '../components/Icons.jsx';
import { memberYear } from '../format.js';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const header = (
    <div className="profile-head">
      <Avatar src={user.photo} name={user.name} size={64} />
      <div>
        <h1>{user.name}</h1>
        <p>{user.area} · Member since {memberYear(user.created_at)}</p>
      </div>
    </div>
  );

  const logout = () => { signOut(); navigate('/login', { replace: true }); };

  return (
    <Screen header={header} nav="profile">
      <div className="menu">
        <Link className="menu-item" to="/my-posts">My posts <ChevronRight /></Link>
        <Link className="menu-item" to="/saved">Saved posts <ChevronRight /></Link>
        <Link className="menu-item" to="/offers?tab=mine">My offers <ChevronRight /></Link>
        <Link className="menu-item" to="/profile/edit">Edit profile <ChevronRight /></Link>
        <button className="menu-item danger" onClick={() => setConfirm(true)}>Log out</button>
      </div>
      <ConfirmDialog open={confirm} title="Log out?" text="You can log back in anytime." confirmLabel="Log out" onCancel={() => setConfirm(false)} onConfirm={logout} />
    </Screen>
  );
}
