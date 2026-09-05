/**
 * The account feature's React Query wiring.
 *
 * Everything the browser asks the auth endpoints goes through here so that the
 * session lives in one cache entry: the `me` read fills it, signing in and out
 * write to it, and the nav re-renders off it. That is what keeps the flows to a
 * single round-trip each — a sign-in confirms itself with the read it needs
 * anyway, and a sign-out needs no read at all.
 *
 * These are option factories rather than hooks so the part worth pinning — which
 * key the session lives under, what each call leaves in it, and when a cached
 * answer may stand in for a fresh one — can be exercised against a real
 * QueryClient without a DOM.
 */
import type { QueryClient } from "@tanstack/react-query";

import {
  type Credentials,
  getAccount,
  requestPasswordReset,
  signOut,
} from "@/lib/auth";

import {
  type CredentialsMode,
  type SubmitView,
  resolveSubmit,
  submitCredentials,
} from "./submit";

/** Where the signed-in visitor is cached. Per site, as the endpoint is. */
export const accountQueryKey = (siteKey: string) =>
  ["account", siteKey] as const;

/**
 * The session lookup.
 *
 * Deliberately carries no cache settings of its own: it inherits the same
 * staleness the rest of the client queries get from `QueryProvider`. The
 * QueryClient is built fresh per page load and lives only in this tab, so there
 * is no cache here to outlast the visitor it belongs to — and the request itself
 * sends `no-store`, which is what stops an HTTP cache from doing that either.
 */
export const accountQueryOptions = (siteKey: string) => ({
  queryKey: accountQueryKey(siteKey),
  queryFn: () => getAccount(siteKey),
});

export type CredentialsVariables = {
  mode: CredentialsMode;
  credentials: Credentials;
};

/**
 * Logging in or signing up, resolved all the way to what the form should show.
 *
 * The three-way outcome is the mutation's data rather than a rejection: two of
 * the three are ordinary answers to render, and only one of those carries the
 * API's own words, which a thrown `Error` would flatten into a message
 * indistinguishable from a translatable one.
 */
export const credentialsMutationOptions = (
  queryClient: QueryClient,
  siteKey: string,
) => ({
  mutationKey: [...accountQueryKey(siteKey), "credentials"],
  mutationFn: async ({
    mode,
    credentials,
  }: CredentialsVariables): Promise<SubmitView> => {
    const outcome = await submitCredentials(mode, siteKey, credentials);

    // A 200 says the API set the session cookie, not that the browser kept it,
    // so a sign-in is only believed once `me` reports it. `staleTime: 0` is the
    // whole point: what is cached at this moment is the signed-out answer this
    // page loaded with, which is exactly the one that must not be reused. The
    // read doubles as the cache update, so the nav needs no second request.
    const hasSession =
      outcome.kind === "signed-in"
        ? !!(await queryClient.fetchQuery({
            ...accountQueryOptions(siteKey),
            staleTime: 0,
          }))
        : false;

    return resolveSubmit(outcome, hasSession);
  },
});

/**
 * Signing out. Unlike the credentials form there is nothing to say but that it
 * did not work, so a refusal is left to React Query's error state.
 */
export const signOutMutationOptions = (
  queryClient: QueryClient,
  siteKey: string,
) => ({
  mutationKey: [...accountQueryKey(siteKey), "signOut"],
  mutationFn: async () => {
    const result = await signOut(siteKey);

    if (!result.ok) {
      throw new Error(result.error ?? "Sign out failed");
    }

    return result.data;
  },
  onSuccess: () => {
    // The response that just arrived is the one that cleared the session
    // cookie, so there is nothing left to find out; re-reading `me` would only
    // spend a round-trip confirming what the 200 already said.
    queryClient.setQueryData(accountQueryKey(siteKey), null);
  },
});

export type PasswordResetVariables = Parameters<typeof requestPasswordReset>[0];

/**
 * Asking for a reset email. Static because it touches nothing cached: the
 * endpoint is not site-scoped, and a reset email changes nothing this tab knows
 * about — the visitor is still signed out until they follow the link.
 */
export const passwordResetMutationOptions = {
  mutationKey: ["account", "passwordReset"],
  mutationFn: async (variables: PasswordResetVariables) => {
    // The endpoint answers with an empty body either way, so its status is the
    // only thing to report and a rejection is all React Query needs.
    if (!(await requestPasswordReset(variables))) {
      throw new Error("Password reset request rejected");
    }
  },
};
