import { authAPI } from 'api/auth';

const ACCESS_TOKEN_REFRESH_MARGIN_SEC = 60; // refresh 60s before expiry
const REFRESH_LOCK_KEY = 'auth:refresh_lock';

let currentAccessExp: number | null = null; // in seconds since epoch
let scheduledRefreshTimer: number | null = null;
let ongoingRefreshPromise: Promise<boolean> | null = null;

// Broadcast across tabs
const broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('auth') : null;
if (broadcast) {
  broadcast.onmessage = (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    // In cookie mode, REFRESH_COMPLETED doesn't carry token; just reschedule by reusing current exp
    if (message.type === 'REFRESH_COMPLETED') {
      // no-op; exp remains the same; caller should have updated exp via /api/auth/me if needed
    }
    if (message.type === 'LOGOUT') {
      clearTokens();
    }
  };
}

const postBroadcast = (msg: any) => {
  try {
    broadcast?.postMessage(msg);
  } catch {
    // ignore
  }
};

export function setAccessExpiry(expSecondsEpoch?: number | null) {
  currentAccessExp = typeof expSecondsEpoch === 'number' ? expSecondsEpoch : null;
  if (scheduledRefreshTimer) {
    window.clearTimeout(scheduledRefreshTimer);
    scheduledRefreshTimer = null;
  }
  if (currentAccessExp) scheduleProactiveRefresh();
}

export function clearTokens() {
  setAccessExpiry(null);
  postBroadcast({ type: 'LOGOUT' });
}

function scheduleProactiveRefresh() {
  if (!currentAccessExp) return;
  if (scheduledRefreshTimer) {
    window.clearTimeout(scheduledRefreshTimer);
    scheduledRefreshTimer = null;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = currentAccessExp - nowSec;
  const secondsUntilRefresh = Math.max(secondsUntilExpiry - ACCESS_TOKEN_REFRESH_MARGIN_SEC, 0);
  const ms = secondsUntilRefresh * 1000;
  if (ms <= 0) {
    // refresh ASAP (in microtask)
    void ensureFreshToken(true);
  } else {
    scheduledRefreshTimer = window.setTimeout(() => {
      void ensureFreshToken(true);
    }, ms);
  }
}

export async function ensureFreshToken(force = false): Promise<boolean> {
  // If not forcing refresh, check if token expires soon
  if (!force) {
    if (!currentAccessExp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    const secondsUntilExpiry = currentAccessExp - nowSec;
    if (secondsUntilExpiry > ACCESS_TOKEN_REFRESH_MARGIN_SEC) {
      return true;
    }
  }
  return await refreshSingleFlight();
}

async function refreshSingleFlight(): Promise<boolean> {
  if (ongoingRefreshPromise) return ongoingRefreshPromise;

  const doRefresh = async (): Promise<boolean> => {
    // Try to acquire a coarse lock via localStorage so only one tab talks to the server
    const now = Date.now();
    try {
      const existing = localStorage.getItem(REFRESH_LOCK_KEY);
      const lock = existing ? JSON.parse(existing) : null;
      if (!lock || now - lock.timestamp > 15000) {
        localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ timestamp: now }));
      }
    } catch {
      // ignore lock errors
    }

    try {
      const response = await authAPI.refresh();
      if (response?.success) {
        // After refresh, fetch new exp from /api/auth/me and schedule proactive refresh
        try {
          const me = await authAPI.getCurrentUser();
          if (me?.success && typeof me.exp === 'number') {
            setAccessExpiry(me.exp);
          }
        } catch {
          // ignore; next request will handle 401 if any
        }
        postBroadcast({ type: 'REFRESH_COMPLETED' });
        return true;
      }
      return false;
    } catch {
      // refresh failed → clear tokens
      clearTokens();
      return false;
    } finally {
      try {
        localStorage.removeItem(REFRESH_LOCK_KEY);
      } catch {
        // ignore
      }
      ongoingRefreshPromise = null;
    }
  };

  ongoingRefreshPromise = doRefresh();
  return ongoingRefreshPromise;
}


