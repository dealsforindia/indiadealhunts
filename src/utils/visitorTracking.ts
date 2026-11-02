// Real-time active watcher presence heartbeat & daily unique visitor engine.
let heartbeatInterval: number | null = null;
let currentVisitorId: string | null = null;

function getVisitorId(): string {
  if (currentVisitorId) return currentVisitorId;
  const key = 'idh-visitor-uuid';
  try {
    let id = localStorage.getItem(key);
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(key, id);
    }
    currentVisitorId = id;
    return id;
  } catch {
    if (!currentVisitorId) {
      currentVisitorId = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
    }
    return currentVisitorId;
  }
}

function resolveApiBase(): string {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) {
    return '';
  }
  return 'https://api.rudranil.me';
}

export function sendHeartbeat(): void {
  if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
  try {
    const id = getVisitorId();
    const base = resolveApiBase();
    void fetch(`${base}/api/v1/analytics/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: id, page: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackStorefrontVisit(): void {
  if (typeof window === 'undefined') return;
  // Send immediate heartbeat on arrival
  sendHeartbeat();

  // Establish continuous presence loop every 25 seconds
  if (!heartbeatInterval) {
    heartbeatInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 25000);

    // Send leave notification when window closes
    window.addEventListener('beforeunload', () => {
      try {
        const id = getVisitorId();
        const base = resolveApiBase();
        const payload = JSON.stringify({ visitor_id: id });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(`${base}/api/v1/analytics/leave`, payload);
        } else {
          void fetch(`${base}/api/v1/analytics/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    });

    // Re-ping immediately when user switches back to tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    });
  }
}
