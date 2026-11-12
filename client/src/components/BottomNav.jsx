import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusIcon, SwapIcon, UserIcon } from './Icons.jsx';

const ITEMS = [
  { key: 'browse', to: '/', label: 'Browse', Icon: HomeIcon },
  { key: 'post', to: '/create', label: 'Post', Icon: PlusIcon },
  { key: 'offers', to: '/offers', label: 'Offers', Icon: SwapIcon },
  { key: 'profile', to: '/profile', label: 'Profile', Icon: UserIcon },
];

// "active" is passed in by each page, because e.g. "My posts" should highlight Profile.
// On phones this is a bottom bar; on desktop the CSS turns it into a left sidebar.
export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map(({ key, to, label, Icon }) => (
        <NavLink key={key} to={to} className={`nav-item ${active === key ? 'active' : ''}`}>
          <Icon width={24} height={24} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
