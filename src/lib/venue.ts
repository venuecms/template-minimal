/**
 * Root of the VenueCMS app. Browser requests to `/api/*` are rewritten here by
 * `src/proxy.ts`, so this is also the origin that serves the hosted account
 * screens — the change-password form a reset email links to.
 */
export const VENUE_APP_URL = "https://app.venuecms.com";
