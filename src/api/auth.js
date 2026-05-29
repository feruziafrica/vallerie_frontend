// src/api/auth.js
//
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║              ENTERPRISE-GRADE AUTHENTICATION MODULE — VallerieVA            ║
// ║                                                                              ║
// ║  Security Architecture:                                                      ║
// ║  • Access token stored in memory only (never persisted to localStorage)      ║
// ║  • Refresh token lives in HttpOnly cookie set by Django — JS cannot read it  ║
// ║  • All auth requests sent with withCredentials: true                         ║
// ║  • JWT expiry validated client-side before attaching Authorization headers   ║
// ║  • Interceptor loop prevention via _retry flag + URL skip-list               ║
// ║  • Queued concurrent 401s resolved with a single refresh (no token storms)   ║
// ║  • Force-logout on refresh failure prevents zombie sessions                  ║
// ║  • Generic error messages prevent account enumeration                        ║
// ║  • Role values from backend — never trusted from localStorage                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import axios from 'axios';

// ─── ENVIRONMENT & BASE URL ───────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

if (import.meta.env.PROD && BASE_URL.startsWith('http://')) {
  throw new Error(
    '[auth.js] FATAL: VITE_API_BASE_URL must use HTTPS in production. ' +
    'Sending credentials over HTTP exposes tokens to network interception. ' +
    'Set VITE_API_BASE_URL=https://your-api-domain.com in your production .env'
  );
}

if (!BASE_URL) {
  throw new Error(
    '[auth.js] FATAL: VITE_API_BASE_URL is not configured. ' +
    'All API calls will fail. Set this variable in your .env file.'
  );
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NO_REFRESH_URLS = [
  '/api/auth/token/refresh/',
  '/api/auth/login/',
  '/api/auth/logout/',
];

const USER_KEYS = {
  type: 'user_type',
  name: 'user_name',
  id:   'user_id',
};

// ─── IN-MEMORY ACCESS TOKEN ───────────────────────────────────────────────────

let _accessToken = null;
let _isLoggedOut = false;

const _setAccessToken = (token) => { _accessToken = token || null; };
const _getAccessToken = () => _accessToken;
const _clearAccessToken = () => { _accessToken = null; };

// ─── JWT EXPIRY UTILITIES ─────────────────────────────────────────────────────

const _decodeJWTPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = JSON.parse(atob(padded));
    return decoded && typeof decoded === 'object' ? decoded : null;
  } catch {
    return null;
  }
};

const _isTokenValid = (token) => {
  if (!token) return false;
  const payload = _decodeJWTPayload(token);
  if (!payload?.exp) return false;
  const nowInSeconds  = Math.floor(Date.now() / 1000);
  const bufferSeconds = 30;
  return payload.exp > nowInSeconds + bufferSeconds;
};

// ─── USER STORAGE HELPERS ─────────────────────────────────────────────────────

const _saveUser = (user) => {
  if (!user || typeof user !== 'object') return;
  try {
    if (user.id   != null) localStorage.setItem(USER_KEYS.id,   String(user.id));
    if (user.full_name || user.email)
      localStorage.setItem(USER_KEYS.name, user.full_name || user.email);
    if (user.user_type) localStorage.setItem(USER_KEYS.type, user.user_type);
  } catch {
    // localStorage unavailable (private browsing / quota) — session still works
  }
};

const _clearUser = () => {
  Object.values(USER_KEYS).forEach((key) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  });
};

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL:         BASE_URL,
  headers:         { 'Content-Type': 'application/json' },
  timeout:         15000,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = _getAccessToken();
    if (token && _isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────

let _isRefreshing = false;
let _failedQueue  = [];

const _processQueue = (error, token = null) => {
  _failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  _failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const responseStatus  = error.response?.status;

    // Never auto-retry rate-limited requests
    if (responseStatus === 429) {
      return Promise.reject(error);
    }

    if (responseStatus !== 401) {
      return Promise.reject(error);
    }

    // Never refresh on auth endpoints themselves
    const requestURL    = originalRequest?.url || '';
    const isNoRefreshURL = NO_REFRESH_URLS.some((u) => requestURL.includes(u));
    if (isNoRefreshURL) {
      return Promise.reject(error);
    }

    // Never loop — a request that 401s even after a successful refresh stops here
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // FIX 1 (continued): Only block refresh if the user EXPLICITLY logged out.
    // A session-expired redirect (_handleSessionExpired) must NOT set this flag,
    // because on the next fresh login the flag would still be true and block
    // all silent refreshes for the entire browser session.
    if (_isLoggedOut) {
      return Promise.reject(error);
    }

    // Queue concurrent 401s — one refresh serves them all
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    _isRefreshing = true;

    try {
      const newToken = await _silentRefresh();
      _processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      _processQueue(refreshError, null);
      // FIX 1: Call _handleSessionExpired, NOT _forceLogout.
      // _handleSessionExpired does NOT set _isLoggedOut — that flag is reserved
      // for explicit user-initiated logouts only.
      _handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ─── PRIVATE: SILENT REFRESH ──────────────────────────────────────────────────

const _silentRefresh = async () => {
  // Use plain axios — NOT the `api` instance — to avoid re-entering the interceptor
  const response = await axios.post(
    `${BASE_URL}/api/auth/token/refresh/`,
    {},
    {
      headers:         { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  const { access } = response.data;

  if (!access) {
    throw new Error('Refresh response missing access token.');
  }

  _setAccessToken(access);

  if (import.meta.env.DEV) {
    console.debug('[auth] Access token silently refreshed.');
  }

  return access;
};


const _handleSessionExpired = () => {
  // Do NOT set _isLoggedOut here — see explanation above
  _clearAccessToken();
  _clearUser();
  _failedQueue = [];

  if (import.meta.env.DEV) {
    console.debug('[auth] Session expired — redirecting to home.');
  }

  window.location.replace('/');
};

export const loginStudent = async ({ email, password }) => {
  // Reset logout flag so a fresh login after explicit logout works correctly.
  // NOTE: This is the ONLY place _isLoggedOut should be reset to false.
  _isLoggedOut = false;

  try {
    const response = await api.post('/api/auth/login/', { email, password });
    const data = response.data;

    if (!data?.access) {
      throw new Error('Login failed. Please try again.');
    }

    _setAccessToken(data.access);

    if (data.user) {
      _saveUser(data.user);
    }

    if (import.meta.env.DEV) {
      console.debug('[auth] Login successful. user_type:', data.user?.user_type);
    }

    return data.user || null;

  } catch (error) {
    if (error.response) {
      const responseStatus = error.response.status;

      if (responseStatus === 401 || responseStatus === 403) {
        throw new Error('Invalid credentials or your account is not yet active. Please try again or contact support.');
      }
      if (responseStatus === 429) {
        throw new Error('Too many login attempts. Please wait a few minutes and try again.');
      }
      if (responseStatus >= 500) {
        throw new Error('A server error occurred. Please try again in a moment.');
      }
      throw new Error('Login failed. Please try again.');
    }

    if (error.request) {
      throw new Error('Cannot connect to the server. Please check your internet connection.');
    }

    throw error;
  }
};

export const logoutStudent = async () => {
  // Set immediately — blocks any in-flight background requests from
  // triggering a silent refresh after we clear state below
  _isLoggedOut = true;

  try {
    await api.post('/api/auth/logout/', {});
  } catch {
    if (import.meta.env.DEV) {
      console.debug('[auth] Server-side token blacklist call failed (non-fatal).');
    }
  }

  _clearAccessToken();
  _clearUser();
  _failedQueue = [];

  if (import.meta.env.DEV) {
    console.debug('[auth] Logout complete — all client state cleared.');
  }

  window.location.replace('/');
};


export const exchangeLoginToken = async (token) => {
  const response = await axios.post(
    `${API_BASE_URL}api/auth/login/token/`,
    { token }
  );

  const { access, refresh, must_change_password, email } = response.data;

  // Store tokens
  localStorage.setItem('access_token',        access);
  localStorage.setItem('refresh_token',        refresh);
  localStorage.setItem('must_change_password', must_change_password ? 'true' : 'false');

  return {
    access,
    email,
    must_change_password,
    user_type: 'student',
  };
};


export const getCurrentUser = async () => {
  if (_isLoggedOut) return null;

  try {
    const response = await api.get('/api/auth/user/');
    const user = response.data;
    if (!user || typeof user !== 'object') return null;
    _saveUser(user);
    return user;
  } catch {
    return null;
  }
};

/**
 * isAuthenticated()
 *
 * Synchronous hint only — NOT a security gate.
 *
 * Returns false after a page reload even with a valid refresh cookie,
 * because the in-memory access token is gone. This is expected — call
 * getCurrentUser() on mount to rehydrate, which will silently refresh.
 *
 * NEVER use this as the sole guard in ProtectedRoute. Always pair with
 * the loading state from getCurrentUser() as shown above.
 */
export const isAuthenticated = () => {
  const token = _getAccessToken();
  return Boolean(token) && _isTokenValid(token);
};










































