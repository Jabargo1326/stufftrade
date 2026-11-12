import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from '../components/Icons.jsx';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/onboarding', { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div className="splash">
      <Fingerprint size={110} />
      <h1>StuffTrade</h1>
      <p>Trade with people nearby</p>
    </div>
  );
}
