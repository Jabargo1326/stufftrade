import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Screen from '../components/Screen.jsx';
import Avatar from '../components/Avatar.jsx';
import PostImage from '../components/PostImage.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { cashLabel } from '../format.js';

export default function PostOffers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [offers, setOffers] = useState(null);
  const [choosing, setChoosing] = useState(null); // the offer being confirmed
  const [busy, setBusy] = useState(false);

  const load = () =>
    Promise.all([api.post(id), api.postOffers(id)])
      .then(([p, o]) => { setPost(p.post); setOffers(o.offers); })
      .catch((e) => { toast(e.message); navigate('/offers', { replace: true }); });
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const decline = async (offer) => {
    try { await api.declineOffer(offer.id); toast('Offer declined'); load(); } catch (e) { toast(e.message); }
  };

  const choose = async () => {
    setBusy(true);
    try {
      await api.chooseOffer(choosing.id);
      navigate('/done/offer-chosen', { replace: true, state: { name: choosing.offerer_name.split(' ')[0] } });
    } catch (e) { toast(e.message); setChoosing(null); } finally { setBusy(false); }
  };

  const canChoose = post?.status === 'open';

  return (
    <Screen title={post ? `${post.title} offers` : 'Offers'} back="/offers" nav="offers">
      {!offers ? <p className="muted center">Loading…</p> : (
        <>
          {canChoose && <p className="muted small">Choose the offer you like most</p>}
          <div className="list">
            {offers.map((o) => (
              <div key={o.id} className="card offer-card">
                <div className="offer-top">
                  <Avatar src={o.offerer_photo} name={o.offerer_name} size={30} />
                  <div className="grow"><strong>{o.offerer_name}</strong><p className="muted small">{cashLabel(o)}</p></div>
                  {o.photos[0] && <PostImage className="thumb sm" photos={o.photos} alt="Offered item" />}
                </div>
                <p>{o.item || 'Cash only'}</p>
                {o.message && <p className="muted small">“{o.message}”</p>}
                {o.status === 'pending' && canChoose ? (
                  <div className="row gap">
                    <button className="btn btn-soft btn-sm" onClick={() => decline(o)}>Decline</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setChoosing(o)}>Choose this offer</button>
                  </div>
                ) : (
                  <span className={`badge ${o.status === 'chosen' ? 'green' : 'red'}`}>{o.status === 'chosen' ? 'Chosen' : 'Declined'}</span>
                )}
              </div>
            ))}
            {offers.length === 0 && <p className="muted center">No offers on this post yet.</p>}
          </div>
        </>
      )}
      <ConfirmDialog open={!!choosing} title="Choose this offer?" text="Other offers will be declined." confirmLabel="Choose" busy={busy} onCancel={() => setChoosing(null)} onConfirm={choose} />
    </Screen>
  );
}
