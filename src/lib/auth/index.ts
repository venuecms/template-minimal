/**
 * Browser-side calls to the VenueCMS auth endpoints.
 *
 * These all go through the relative `/api/*` paths that `src/proxy.ts` rewrites
 * onto the VenueCMS app, which matters for two reasons: the proxy attaches this
 * site's API key, and — because the rewrite keeps the browser on this site's
 * origin — the Supabase session cookies the API sets come back scoped to this
 * domain. That is what keeps a visitor signed in across requests, so none of the
 * tokens in the sign-in response need to be stored by the template.
 */
import type {
  PublicSignInResponse,
  PublicSignOutResponse,
  PublicSignUpResponse,
} from "@venuecms/sdk-next";

import { VENUE_APP_URL } from "../venue";

/**
 * A signed-in visitor, as reported by the site's `me` endpoint.
 *
 * `name` can be empty: an account created through public signup has only an
 * email until someone fills the rest in. Having a record at all is what makes a
 * visitor signed in, so callers label an empty name rather than treating it as
 * no session.
 */
export type Account = {
  name: string;
  roles: Array<{ name: string }>;
};

export type Credentials = {
  email: string;
  password: string;
};

/**
 * The auth endpoints answer a failure with a human-readable `error` string
 * rather than throwing, so callers get one shape to branch on. `error` is null
 * when the failure produced no message to show — a dropped connection, or a
 * body the API did not fill in — and the caller supplies a translated one.
 */
export type AuthResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string | null };

const isErrorBody = (value: unknown): value is { error: string } =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  typeof value.error === "string";

const isNamed = (value: unknown): value is { name: string } =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string";

/**
 * Normalises a `me` record, defaulting the name and roles a site may not set.
 * Only a record that is not an object at all counts as no account.
 */
const toAccount = (value: unknown): Account | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const name = isNamed(value) ? value.name : "";
  const roles =
    "roles" in value && Array.isArray(value.roles)
      ? value.roles.filter(isNamed)
      : [];

  return { name, roles };
};

/**
 * The API's `{ error }` message, or null when it did not send one — the caller
 * translates a generic message in that case rather than showing English here.
 */
const readError = async (response: Response): Promise<string | null> => {
  const body: unknown = await response.json().catch(() => null);

  return isErrorBody(body) ? body.error : null;
};

const authUrl = (siteKey: string, action: string) =>
  `/api/v2/${encodeURIComponent(siteKey)}/public/auth/${action}`;

const postJson = async <TData>(
  url: string,
  body?: Credentials,
): Promise<AuthResult<TData>> => {
  // A dropped connection or an unparseable body has to come back as a result
  // the form can render. These calls run inside `startTransition`, where a throw
  // would escape to the nearest error boundary and take the page down rather
  // than the dialog.
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });

    if (!response.ok) {
      return { ok: false, error: await readError(response) };
    }

    // A success with nothing in it is still a success; only the status says
    // whether the call worked.
    const data: unknown = await response.json().catch(() => null);

    return { ok: true, data: (data ?? {}) as TData };
  } catch {
    return { ok: false, error: null };
  }
};

export const signIn = (siteKey: string, credentials: Credentials) =>
  postJson<PublicSignInResponse>(authUrl(siteKey, "signin"), credentials);

/**
 * Sites opt into public signups; the API answers 403 when this one has not, and
 * that message is what the form surfaces.
 */
export const signUp = (siteKey: string, credentials: Credentials) =>
  postJson<PublicSignUpResponse>(authUrl(siteKey, "signup"), credentials);

export const signOut = (siteKey: string) =>
  postJson<PublicSignOutResponse>(authUrl(siteKey, "signout"));

/**
 * Resolves to the signed-in visitor, or null when there is no session.
 *
 * On v1 because v2 has no `me`; it answers 200 with an empty `records` rather
 * than a 401, so an empty list is the signed-out signal.
 */
export const getAccount = async (siteKey: string): Promise<Account | null> => {
  try {
    const response = await fetch(
      `/api/v1/${encodeURIComponent(siteKey)}/public/me`,
      // Whose session this is depends on a cookie, so a cached copy could
      // report the previous visitor — including after they signed out.
      { cache: "no-store" },
    );

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json().catch(() => null);

    if (
      typeof body !== "object" ||
      body === null ||
      !("records" in body) ||
      !Array.isArray(body.records)
    ) {
      return null;
    }

    const [account] = body.records;

    return toAccount(account);
  } catch {
    return null;
  }
};

/**
 * Asks for a reset email. The link in it lands on the VenueCMS-hosted change
 * password screen, which sends the visitor back to `origin` when they are done.
 *
 * Also on v1 — v2 has no reset endpoint — and unlike the others it is not
 * site-scoped and answers with an empty body either way, so there is no message
 * to surface and the caller only needs to know whether it was accepted.
 */
export const requestPasswordReset = async ({
  email,
  origin,
}: {
  email: string;
  origin: string;
}): Promise<boolean> => {
  const params = new URLSearchParams({
    redirectUrl: `${VENUE_APP_URL}/account/changePassword`,
    origin,
  });

  const body = new FormData();
  body.set("email", email);

  try {
    const response = await fetch(`/api/auth/resetPassword?${params}`, {
      method: "POST",
      body,
    });

    return response.ok;
  } catch {
    return false;
  }
};
