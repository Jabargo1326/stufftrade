import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, SwapIcon, SearchIcon, PlusIcon, CheckIcon } from '../components/Icons.jsx';

const STEPS = [
  { Icon: SwapIcon, title: 'Trade With A Friend', text: "Swap what you don't use for what you need." },
  { Icon: SearchIcon, title: 'Easy Trading Process', text: 'Browse posts, make an offer, agree on a meet-up.' },
  { Icon: PlusIcon, title: 'Discard Old Items', text: 'Post things you no longer need and wait for offers.' },
  { Icon: CheckIcon, title: 'Are You Ready?', text: "Let's find your next trade." },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const next = () => {
    if (!last) return setI(i + 1);
    localStorage.setItem('st_seen_intro', '1');
    navigate('/login', { replace: true });
  };

  return (
    <div className="onboarding">
      <div className="onboarding-art"><Fingerprint size={110} /></div>
      <div className="onboarding-card">
        <div className="onboarding-inner">
          <step.Icon width={22} height={22} />
          <h2>{step.title}</h2>
          <p className="muted">{step.text}</p>
          <div className="dots" aria-hidden="true">
            {STEPS.map((_, n) => <span key={n} className={n === i ? 'on' : ''} />)}
          </div>
          <button className="btn btn-dark" onClick={next}>{last ? "Let's continue" : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
