import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Splash from './pages/Splash.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Saved from './pages/Saved.jsx';
import PostForm from './pages/PostForm.jsx';
import Done from './pages/Done.jsx';
import Profile from './pages/Profile.jsx';
import MyPosts from './pages/MyPosts.jsx';
import PostOffers from './pages/PostOffers.jsx';
import Offers from './pages/Offers.jsx';
import EditProfile from './pages/EditProfile.jsx';

// Only logged-in people can see these pages.
function Private({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="boot">Loading…</div>;
  if (!user) {
    const seen = localStorage.getItem('st_seen_intro');
    return <Navigate to={seen ? '/login' : '/splash'} replace state={{ from: loc.pathname }} />;
  }
  return children;
}

// Login/signup are skipped if you're already logged in.
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Loading…</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/splash" element={<Public><Splash /></Public>} />
      <Route path="/onboarding" element={<Public><Onboarding /></Public>} />
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/signup" element={<Public><Signup /></Public>} />

      <Route path="/" element={<Private><Home /></Private>} />
      <Route path="/post/:id" element={<Private><PostDetail /></Private>} />
      <Route path="/post/:id/offers" element={<Private><PostOffers /></Private>} />
      <Route path="/post/:id/edit" element={<Private><PostForm mode="edit" /></Private>} />
      <Route path="/create" element={<Private><PostForm mode="create" /></Private>} />
      <Route path="/saved" element={<Private><Saved /></Private>} />
      <Route path="/offers" element={<Private><Offers /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />
      <Route path="/profile/edit" element={<Private><EditProfile /></Private>} />
      <Route path="/my-posts" element={<Private><MyPosts /></Private>} />
      <Route path="/done/:kind" element={<Private><Done /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
