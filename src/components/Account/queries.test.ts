/**
 * What the account calls leave in the query cache.
 *
 * The transport is pinned next door in `src/lib/auth`; what is worth holding
 * still here is the caching, because that is the part with no visible symptom
 * until it is wrong: a sign-in that trusts the signed-out answer already in the
 * cache reports a working login as a failure, and a sign-out that forgets to
 * write the cache leaves the nav naming a visitor who has gone.
 *
 * Driven through a real `MutationObserver` rather than by calling the option
 * objects' fields directly, so the ordering React Query actually uses — the
 * mutation function, then `onSuccess` — is what gets exercised.
 */
import {
  MutationObserver,
  type MutationObserverOptions,
  QueryClient,
  QueryObserver,
  notifyManager,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/lib/auth";

import {
  accountQueryKey,
  accountQueryOptions,
  credentialsMutationOptions,
  passwordResetMutationOptions,
  signOutMutationOptions,
} from "./queries";

const SITE = "sample";
const credentials = { email: "someone@example.com", password: "hunter22" };
const ada: Account = { name: "Ada Lovelace", roles: [{ name: "member" }] };

/** Whether the mocked API currently has a session for this visitor. */
let signedIn = false;
let requestedUrls: string[] = [];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * A stand-in for the API that answers `me` from `signedIn`, so a test can flip
 * the session the way a real sign-in does and see which answer the cache used.
 */
const respond = (url: string): Response => {
  if (url.includes("/public/me")) {
    return json({ records: signedIn ? [ada] : [] });
  }

  return json({ session: {}, user: { id: "user-id" } });
};

const mockApi = (handler: (url: string) => Response = respond) => {
  requestedUrls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      requestedUrls.push(url);
      return Promise.resolve(handler(url));
    }),
  );
};

const meRequests = () => requestedUrls.filter((url) => url.includes("/me"));

/**
 * The app's own caching, since these tests are about whether a cached answer is
 * allowed to stand in for a fresh one — with a zero stale time nothing here
 * would mean anything.
 */
const newQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, gcTime: 1000 * 60 * 15, retry: false },
    },
  });

const runMutation = <TData, TVariables>(
  client: QueryClient,
  options: MutationObserverOptions<TData, Error, TVariables>,
  variables: TVariables,
) => new MutationObserver(client, options).mutate(variables);

/**
 * Runs a mutation the way `useMutation` does — with a subscriber attached, and
 * with the per-call callbacks a component passes to `mutate`. React Query drops
 * those callbacks when the observer has no listeners, so a mutation driven
 * without subscribing would never report back.
 */
const runSubscribedMutation = <TData, TVariables>(
  client: QueryClient,
  options: MutationObserverOptions<TData, Error, TVariables>,
  variables: TVariables,
  onSuccess: (data: TData) => void,
) => {
  const observer = new MutationObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});

  return observer.mutate(variables, { onSuccess }).finally(() => unsubscribe());
};

/** Lets React Query's scheduled subscriber notifications run. */
const flushNotifications = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Stands in for the nav: a subscriber that re-renders off the cached session,
 * recording when it hears about a change.
 *
 * Subscribed through `notifyManager.batchCalls`, which is how `useQuery` hands
 * its store callback to React — and the reason a cache write cannot re-render
 * anything until the current task ends. Subscribing the listener raw would make
 * this fire synchronously and measure an ordering React never sees.
 */
const watchAccount = (client: QueryClient, record: () => void) => {
  const observer = new QueryObserver(client, {
    ...accountQueryOptions(SITE),
    // Only the cache writes are of interest here, not a fetch on subscribe.
    enabled: false,
  });

  return observer.subscribe(notifyManager.batchCalls(record));
};

let queryClient: QueryClient;

beforeEach(() => {
  signedIn = false;
  queryClient = newQueryClient();
  mockApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("accountQueryOptions", () => {
  it("caches the session under a key of its own per site", async () => {
    signedIn = true;

    await queryClient.fetchQuery(accountQueryOptions(SITE));

    expect(queryClient.getQueryData(accountQueryKey(SITE))).toEqual(ada);
    // Another site's visitors are a different session entirely.
    expect(queryClient.getQueryData(accountQueryKey("other"))).toBeUndefined();
  });

  it("serves a second reader from the cache rather than the endpoint", async () => {
    // Every page has a nav, and the nav asks who is signed in; paying for `me`
    // on each of them is what the caching is here to avoid.
    await queryClient.fetchQuery(accountQueryOptions(SITE));
    await queryClient.fetchQuery(accountQueryOptions(SITE));

    expect(meRequests()).toHaveLength(1);
  });
});

describe("credentialsMutationOptions", () => {
  it("confirms a login against the endpoint, not the signed-out answer already cached", async () => {
    // The page loaded signed out, so that is what is in the cache. Reusing it
    // here would report a login that worked as one whose session did not stick.
    await queryClient.fetchQuery(accountQueryOptions(SITE));
    expect(queryClient.getQueryData(accountQueryKey(SITE))).toBeNull();

    signedIn = true;

    const view = await runMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      { mode: "login" as const, credentials },
    );

    expect(view).toEqual({ kind: "close" });
  });

  it("leaves the new session in the cache, so nothing has to re-read it", async () => {
    signedIn = true;

    await runMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      {
        mode: "login" as const,
        credentials,
      },
    );

    expect(queryClient.getQueryData(accountQueryKey(SITE))).toEqual(ada);
    // The confirmation read is the update; a separate refetch would be a second
    // round-trip for an answer already in hand.
    expect(meRequests()).toHaveLength(1);
  });

  it("tells the caller to close before the new session reaches the nav", async () => {
    // Same hazard as signing out, from the other direction: the confirmation
    // read inside the mutation writes the session to the cache, and the nav
    // re-rendering off it would swap this form for the account menu. The close
    // callback has to be delivered first or the dialog stays open on a visitor
    // who is by then signed in.
    signedIn = true;

    const order: string[] = [];
    const unwatch = watchAccount(queryClient, () => order.push("nav"));

    await runSubscribedMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      { mode: "login" as const, credentials },
      () => order.push("dialog closed"),
    );
    await flushNotifications();
    unwatch();

    expect(order[0]).toBe("dialog closed");
    expect(order).toContain("nav");
  });

  it("reports a login whose session did not stick rather than closing", async () => {
    // The API set a cookie the browser did not keep, so `me` still says nobody.
    const view = await runMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      { mode: "login" as const, credentials },
    );

    expect(view).toEqual({
      kind: "error",
      message: { key: "session_failed" },
    });
  });

  it("passes a rejection back without going near the session", async () => {
    mockApi((url) =>
      url.includes("/public/me")
        ? json({ records: [] })
        : json({ error: "Invalid login credentials" }, 401),
    );

    const view = await runMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      { mode: "login" as const, credentials },
    );

    expect(view).toEqual({
      kind: "error",
      message: { text: "Invalid login credentials" },
    });
    // Nothing was signed in, so there is no session to go looking for.
    expect(meRequests()).toHaveLength(0);
    expect(queryClient.getQueryData(accountQueryKey(SITE))).toBeUndefined();
  });

  it("shows the confirm-email notice without looking for a session", async () => {
    mockApi((url) =>
      url.includes("/public/me")
        ? json({ records: [] })
        : json({ user: { id: "user-id" }, confirmEmail: true }),
    );

    const view = await runMutation(
      queryClient,
      credentialsMutationOptions(queryClient, SITE),
      { mode: "signup" as const, credentials },
    );

    expect(view).toEqual({ kind: "notice", message: { key: "confirm_email" } });
    expect(meRequests()).toHaveLength(0);
  });
});

describe("signOutMutationOptions", () => {
  it("clears the cached session without re-reading it", async () => {
    signedIn = true;
    await queryClient.fetchQuery(accountQueryOptions(SITE));
    requestedUrls = [];

    await runMutation(
      queryClient,
      signOutMutationOptions(queryClient, SITE),
      undefined,
    );

    expect(queryClient.getQueryData(accountQueryKey(SITE))).toBeNull();
    // The response that arrived is the one that cleared the cookie; asking `me`
    // to confirm it would be a round-trip for a known answer.
    expect(meRequests()).toHaveLength(0);
  });

  it("tells the caller it worked before the cleared session reaches the nav", async () => {
    // The dialog closes from the caller's own callback while the nav re-renders
    // off the cache, and React Query drops a `mutate`-level callback once its
    // observer has no listeners. So if the cache write reached the nav first,
    // the menu would come down before the callback was delivered and the
    // visitor would be left signed out on a dialog showing the log-in form.
    signedIn = true;
    await queryClient.fetchQuery(accountQueryOptions(SITE));

    const order: string[] = [];
    const unwatch = watchAccount(queryClient, () => order.push("nav"));

    await runSubscribedMutation(
      queryClient,
      signOutMutationOptions(queryClient, SITE),
      undefined,
      () => order.push("dialog closed"),
    );
    await flushNotifications();
    unwatch();

    expect(order[0]).toBe("dialog closed");
    expect(order).toContain("nav");
  });

  it("rejects and keeps the visitor signed in when the API refuses", async () => {
    // Reporting a sign-out that did not happen would leave a live session
    // behind a nav that says there is none.
    signedIn = true;
    await queryClient.fetchQuery(accountQueryOptions(SITE));
    mockApi(() => json({ error: "Could not sign out" }, 500));

    await expect(
      runMutation(
        queryClient,
        signOutMutationOptions(queryClient, SITE),
        undefined,
      ),
    ).rejects.toThrow("Could not sign out");

    expect(queryClient.getQueryData(accountQueryKey(SITE))).toEqual(ada);
  });
});

describe("passwordResetMutationOptions", () => {
  it("resolves once the API accepts the address", async () => {
    mockApi(() => new Response(null, { status: 200 }));

    await expect(
      runMutation(queryClient, passwordResetMutationOptions, {
        email: credentials.email,
        origin: "https://example.com",
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects when the API will not send the email", async () => {
    // This endpoint answers with an empty body either way, so its status is the
    // only thing there is to report.
    mockApi(() => new Response(null, { status: 422 }));

    await expect(
      runMutation(queryClient, passwordResetMutationOptions, {
        email: credentials.email,
        origin: "https://example.com",
      }),
    ).rejects.toThrow();
  });
});
