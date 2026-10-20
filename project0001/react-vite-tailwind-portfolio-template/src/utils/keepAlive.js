/**
 * Keep-Alive Script for Render Backend
 * 
 * Behavior:
 * - Pings the backend every 30 minutes.
 * - Pauses pings when the user is active (mouse move, key press, scroll, etc.).
 * - Resumes pings if the user is idle for 10 minutes OR if the tab is hidden.
 */

const SERVER_URL = 'https://backendfarmgun.onrender.com/';
const PING_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;  // 20 minutes

let pingIntervalId = null;
let idleTimeoutId = null;
let isPinging = false;

const startPinging = () => {
    if (isPinging) return;

    console.log('🔌 [KeepAlive] Starting background pings...');
    isPinging = true;

    // Initial ping
    pingServer();

    // Schedule periodic pings
    pingIntervalId = setInterval(pingServer, PING_INTERVAL_MS);
};

const stopPinging = () => {
    if (!isPinging) return;

    console.log('🔌 [KeepAlive] Stopping background pings (User Active)...');
    isPinging = false;

    if (pingIntervalId) {
        clearInterval(pingIntervalId);
        pingIntervalId = null;
    }
};

const pingServer = async () => {
    try {
        console.log(`🔌 [KeepAlive] Pinging ${SERVER_URL}...`);
        // Using no-cors to avoid CORS errors if the server doesn't support it for pings
        // and keepalive: true for robustness when tab is closing/backgrounded
        await fetch(SERVER_URL, {
            method: 'GET',
            mode: 'no-cors',
            keepalive: true
        });
    } catch (error) {
        console.error('🔌 [KeepAlive] Ping failed:', error);
    }
};

const resetIdleTimer = () => {
    // If the tab is hidden, we don't count it as "active", keep pinging
    if (document.hidden) return;

    // User is active, so stop pinging
    stopPinging();

    // Clear existing idle timer
    if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
    }

    // Set new idle timer
    idleTimeoutId = setTimeout(() => {
        console.log('🔌 [KeepAlive] User is idle. Resuming pings...');
        startPinging();
    }, IDLE_TIMEOUT_MS);
};

const handleVisibilityChange = () => {
    if (document.hidden) {
        console.log('🔌 [KeepAlive] Tab hidden. Resuming pings immediately...');
        // Clear idle timer so we don't get double triggers, though startPinging is idempotent
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        startPinging();
    } else {
        // Tab became visible. Treat as activity.
        console.log('🔌 [KeepAlive] Tab visible.');
        resetIdleTimer();
    }
};

export const initKeepAlive = () => {
    console.log('🔌 [KeepAlive] Initialized');

    // Events that signify user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Debounce/throttle could be added here if performance was a tight constraint,
    // but resetting a timer is very cheap.
    events.forEach(event => {
        window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Handle visibility changes (tab switch/minimize)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial state check
    if (document.hidden) {
        startPinging();
    } else {
        resetIdleTimer();
    }
};
