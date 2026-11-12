export const CATEGORY_EMOJI = {
  Gadgets: '📱', Clothes: '👕', Books: '📚', Home: '🏠', Sports: '🚲', Toys: '🧸', Music: '🎸', Other: '📦',
};

// SQLite stores "2026-11-12 08:30:00" in UTC
const parse = (s) => new Date(String(s).replace(' ', 'T') + 'Z');

export function timeAgo(s) {
  const mins = Math.floor((Date.now() - parse(s).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export const memberYear = (s) => parse(s).getFullYear();

export const offerCount = (n) => (n === 0 ? 'No offers' : n === 1 ? '1 offer' : `${n} offers`);

// "Plus 100 cash" / "300 cash" / "No cash"
export function cashLabel(o) {
  if (!o.cash) return 'No cash';
  return o.item ? `Plus ${o.cash.toLocaleString()} cash` : `${o.cash.toLocaleString()} cash`;
}

// "old keyboard + 500" / "1,200 cash" / "electric fan"
export function offerSummary(o) {
  if (o.item && o.cash) return `${o.item} + ${o.cash.toLocaleString()}`;
  if (o.cash) return `${o.cash.toLocaleString()} cash`;
  return o.item;
}
