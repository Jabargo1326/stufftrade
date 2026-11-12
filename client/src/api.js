// Tiny wrapper around fetch() so every page talks to the backend the same way.
const BASE = import.meta.env.VITE_API_URL || ''; // empty = same origin (Vite proxy in dev)
const TOKEN_KEY = 'st_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

// turns "/uploads/abc.jpg" into a full url (works in dev and when deployed)
export const imgUrl = (u) => (u ? (u.startsWith('http') ? u : BASE + u) : null);

async function request(path, { method = 'GET', json, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form; // FormData sets its own content-type
  }

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body });
  } catch {
    throw Object.assign(new Error('Cannot reach the server. Is the backend running?'), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      setToken(null);
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw Object.assign(new Error(data.error || 'Something went wrong.'), {
      status: res.status,
      field: data.field,
      fields: data.fields || {},
    });
  }
  return data;
}

export const api = {
  // auth + profile
  signup: (body) => request('/auth/signup', { method: 'POST', json: body }),
  login: (body) => request('/auth/login', { method: 'POST', json: body }),
  me: () => request('/auth/me'),
  updateProfile: (form) => request('/auth/me', { method: 'PUT', form }),
  // posts
  categories: () => request('/posts/categories'),
  posts: ({ q = '', category = 'All' } = {}) =>
    request(`/posts?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  myPosts: () => request('/posts/mine'),
  savedPosts: () => request('/posts/saved'),
  post: (id) => request(`/posts/${id}`),
  createPost: (form) => request('/posts', { method: 'POST', form }),
  updatePost: (id, form) => request(`/posts/${id}`, { method: 'PUT', form }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  toggleSave: (id) => request(`/posts/${id}/save`, { method: 'POST' }),
  // offers
  postOffers: (id) => request(`/posts/${id}/offers`),
  sendOffer: (id, form) => request(`/posts/${id}/offers`, { method: 'POST', form }),
  myOffers: () => request('/offers/mine'),
  chooseOffer: (id) => request(`/offers/${id}/choose`, { method: 'POST' }),
  declineOffer: (id) => request(`/offers/${id}/decline`, { method: 'POST' }),
};
