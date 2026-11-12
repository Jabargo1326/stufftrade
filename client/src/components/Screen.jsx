import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';
import { ChevronLeft } from './Icons.jsx';

// Page wrapper: coloured header (title + optional back arrow) + content + optional bottom nav.
// tone: "dark" (plum) or "maroon" (login/signup).  header: extra header content (e.g. search bar).
export default function Screen({ title, back, tone = 'dark', header, nav, children, className = '' }) {
  const navigate = useNavigate();
  const goBack = () => (typeof back === 'string' ? navigate(back) : navigate(-1));
  return (
    <div className={`shell ${nav ? 'has-nav' : ''}`}>
      {(title || header) && (
        <header className={`topbar ${tone}`}>
          <div className="topbar-inner">
            {title && (
              <div className="topbar-title">
                {back && (
                  <button className="icon-btn" onClick={goBack} aria-label="Back"><ChevronLeft /></button>
                )}
                <h1>{title}</h1>
              </div>
            )}
            {header}
          </div>
        </header>
      )}
      <main className={`content ${className}`}>{children}</main>
      {nav && <BottomNav active={nav} />}
    </div>
  );
}

export function EmptyState({ icon, title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {children}
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="error-text">{error}</span>}
    </label>
  );
}
