// ── Universal backend URL ─────────────────────────────────────────────────────
// This is the single place to change when deploying to staging or production.
// Set VITE_API_URL in your .env file.

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const APP_NAME: string =
  import.meta.env.VITE_APP_NAME ?? 'AttendTrack';
