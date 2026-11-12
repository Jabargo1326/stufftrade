import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import Screen from '../components/Screen.jsx';
import { CheckIcon } from '../components/Icons.jsx';

// One page for the three "success" screens: post published / offer sent / offer chosen.
export default function Done() {
  const { kind } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const name = state?.name || 'The owner';

  const screens = {
    published: {
      nav: 'post',
      title: 'Post published',
      text: 'People nearby can now see your trade post.',
      primary: ['View my posts', '/my-posts'],
      secondary: ['Create another', '/create'],
    },
    'offer-sent': {
      title: 'Offer sent',
      text: `${name} will see your offer. You can follow it in Offers.`,
      primary: ['View my offers', '/offers?tab=mine'],
      secondary: ['Keep browsing', '/'],
    },
    'offer-chosen': {
      title: 'Offer chosen',
      text: `${name} has been notified. The other offers were declined.`,
      primary: ['Back to my posts', '/my-posts'],
      secondary: ['Browse trade posts', '/'],
    },
  };
  const s = screens[kind];
  if (!s) return <Navigate to="/" replace />;

  return (
    <Screen nav={s.nav}>
      <div className="done">
        <div className="done-circle"><CheckIcon width={44} height={44} strokeWidth={2.6} /></div>
        <h2>{s.title}</h2>
        <p className="muted">{s.text}</p>
      </div>
      <div className="done-actions">
        <button className="btn btn-primary" onClick={() => navigate(s.primary[1])}>{s.primary[0]}</button>
        <button className="btn btn-soft" onClick={() => navigate(s.secondary[1])}>{s.secondary[0]}</button>
      </div>
    </Screen>
  );
}
