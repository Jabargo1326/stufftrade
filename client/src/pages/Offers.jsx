import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen, { EmptyState } from '../components/Screen.jsx';
import PostImage from '../components/PostImage.jsx';
import { ChevronRight, SwapIcon } from '../components/Icons.jsx';
import { offerSummary } from '../format.js';

const STATUS = { pending: ['Pending', 'yellow'], chosen: ['Chosen', 'green'], declined: ['Not chosen', 'red'] };

export default function Offers() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'mine' ? 'mine' : 'posts';
  const [myPosts, setMyPosts] = useState(null);
  const [myOffers, setMyOffers] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.myPosts().then((d) => setMyPosts(d.posts.filter((p) => p.offers_count > 0))).catch((e) => toast(e.message));
    api.myOffers().then((d) => setMyOffers(d.offers)).catch((e) => toast(e.message));
  }, [toast]);

  const header = (
    <>
      <h1 className="plain-title">Offers</h1>
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'posts'} className={tab === 'posts' ? 'on' : ''} onClick={() => setParams({})}>On my posts</button>
        <button role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'on' : ''} onClick={() => setParams({ tab: 'mine' })}>My offers</button>
      </div>
    </>
  );

  const list = tab === 'posts' ? myPosts : myOffers;

  return (
    <Screen header={header} nav="offers">
      {list === null ? <p className="muted center">Loading…</p> : list.length === 0 ? (
        <EmptyState
          icon={<SwapIcon width={56} height={56} />}
          title="No offers yet"
          text={tab === 'posts' ? 'Offers on your posts will show up here' : 'Offers you make will show up here'}
        />
      ) : tab === 'posts' ? (
        <div className="list">
          {list.map((p) => (
            <Link key={p.id} to={`/post/${p.id}/offers`} className="card list-row">
              <PostImage className="thumb" photos={p.photos} category={p.category} alt="" />
              <div className="grow">
                <strong>{p.title}</strong>
                <p className="muted small">
                  {p.status === 'traded' ? 'Traded' : p.pending_count > 0 ? `${p.pending_count} offer${p.pending_count > 1 ? 's' : ''} waiting` : 'All offers answered'}
                </p>
              </div>
              <ChevronRight />
            </Link>
          ))}
        </div>
      ) : (
        <div className="list">
          {list.map((o) => {
            const [label, color] = STATUS[o.status];
            return (
              <Link key={o.id} to={`/post/${o.post_id}`} className="card list-row">
                <PostImage className="thumb" photos={o.post_photos} category={o.post_category} alt="" />
                <div className="grow">
                  <strong>{o.post_title}</strong>
                  <p className="muted small ellipsis">My offer: {offerSummary(o)}</p>
                </div>
                <span className={`badge ${color}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
