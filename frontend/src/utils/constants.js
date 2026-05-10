// Base URL for the backend API — reads from Vite env var in production,
// falls back to localhost for local development.
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
