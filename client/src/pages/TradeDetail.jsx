import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen from '../components/Screen.jsx';
import Avatar from '../components/Avatar.jsx';
import PostImage from '../components/PostImage.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import { offerSummary } from '../format.js';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [trade, setTrade] = useState(null);
  const [missing, setMissing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => api.trade(id).then((d) => setTrade(d.trade)).catch(() => setMissing(true));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (missing) return <Screen title="Trade details" back="/trades" nav="profile" navMobile={false}><p className="muted center pad">This trade doesn't exist.</p></Screen>;
  if (!trade) return <Screen title="Trade details" back="/trades" nav="profile" navMobile={false}><p className="muted center pad">Loading…</p></Screen>;

  const { post, offer, other } = trade;
  const first = other.name.split(' ')[0];
  const done = trade.status === 'completed';
  const iPost = trade.role === 'owner'; // I posted the item
  const postLine = post.title;
  const offerLine = offerSummary(offer) || 'Cash only';

  const finish = async () => {
    setBusy(true);
    try {
      const res = await api.confirmTrade(trade.id);
      setConfirm(false);
      if (res.completed) navigate('/done/trade-complete', { replace: true, state: { name: first } });
      else { toast(`Confirmed. Waiting for ${first}.`); load(); }
    } catch (e) { toast(e.message); setConfirm(false); } finally { setBusy(false); }
  };

  return (
    <Screen title="Trade details" back="/trades" nav="profile" navMobile={false}>
      <div className="trade-wrap">
        <div className={`trade-banner ${done ? 'done' : ''}`}>
          {done ? <CheckIcon width={22} height={22} strokeWidth={2.6} /> : <span className="dot" />}
          <div>
            <strong>{done ? 'Trade successful' : 'Trade agreed'}</strong>
            <p className="small">{done ? 'Both of you confirmed the exchange.' : `Meet up with ${first} to swap, then confirm below.`}</p>
          </div>
        </div>

        <div className="trade-grid">
          <div className="card trade-item">
            <span className="muted small">{iPost ? 'You give' : 'You get'}</span>
            <div className="trade-item-row">
              <PostImage className="thumb" photos={post.photos} category={post.category} alt="" />
              <div className="grow"><strong>{postLine}</strong><p className="muted small ellipsis">{post.category} · {post.area}</p></div>
            </div>
          </div>
          <div className="card trade-item">
            <span className="muted small">{iPost ? 'You get' : 'You give'}</span>
            <div className="trade-item-row">
              <PostImage className="thumb" photos={offer.photos} category="Other" alt="" />
              <div className="grow"><strong>{offerLine}</strong>{offer.message && <p className="muted small">“{offer.message}”</p>}</div>
            </div>
          </div>
        </div>

        <div className="card trade-partner">
          <span className="muted small">Trade partner</span>
          <Link to={`/user/${other.id}`} className="trade-item-row">
            <Avatar src={other.photo} name={other.name} size={44} />
            <div className="grow"><strong>{other.name}</strong><p className="muted small">{other.area}</p></div>
            <span className="link small">View profile</span>
          </Link>
          <div className="contact">
            <span className="muted small">Mobile number (for the meet-up)</span>
            <a href={`tel:${other.mobile}`}><strong>{other.mobile}</strong></a>
          </div>
        </div>

        <div className="card trade-steps">
          <div className={`step ${trade.me_confirmed || done ? 'ok' : ''}`}><span className="tick"><CheckIcon width={14} height={14} strokeWidth={3} /></span>You confirmed</div>
          <div className={`step ${trade.other_confirmed || done ? 'ok' : ''}`}><span className="tick"><CheckIcon width={14} height={14} strokeWidth={3} /></span>{first} confirmed</div>
        </div>

        {!done && !trade.me_confirmed && (
          <button className="btn btn-primary" onClick={() => setConfirm(true)}>Confirm trade completed</button>
        )}
        {!done && trade.me_confirmed && (
          <p className="muted center small">Waiting for {first} to confirm…</p>
        )}
        {done && <button className="btn btn-soft" onClick={() => navigate('/trades')}>Back to my trades</button>}
      </div>

      <ConfirmDialog
        open={confirm}
        title="Confirm this trade?"
        text="Only confirm after you have both exchanged the items."
        confirmLabel="Confirm"
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={finish}
      />
    </Screen>
  );
}
