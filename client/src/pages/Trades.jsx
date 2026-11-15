import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import PostImage from '../components/PostImage.jsx';
import { SwapIcon } from '../components/Icons.jsx';
import { timeAgo } from '../format.js';

export default function Trades() {
  const [trades, setTrades] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.trades().then((d) => setTrades(d.trades)).catch((e) => { setTrades([]); toast(e.message); });
  }, [toast]);

  return (
    <Screen title="My trades" back="/profile" nav="profile">
      {trades === null ? <p className="muted center">Loading…</p> : trades.length === 0 ? (
        <EmptyState icon={<SwapIcon width={56} height={56} />} title="No trades yet" text="When an offer is chosen, the trade shows up here" />
      ) : (
        <div className="list">
          {trades.map((t) => (
            <Link key={t.id} to={`/trade/${t.id}`} className="card list-row">
              <PostImage className="thumb" photos={t.post_photos} category={t.post_category} alt="" />
              <div className="grow">
                <strong>{t.post_title}</strong>
                <p className="muted small ellipsis">With {t.other_name} · {timeAgo(t.completed_at || t.created_at)}</p>
              </div>
              <span className={`badge ${t.status === 'completed' ? 'green' : 'yellow'}`}>{t.status === 'completed' ? 'Completed' : 'Agreed'}</span>
            </Link>
          ))}
        </div>
      )}
    </Screen>
  );
}
