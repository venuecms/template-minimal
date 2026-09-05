/**
 * The auth calls, pinned at the network boundary.
 *
 * Everything here is a thin wrapper over `fetch`, so what is worth holding still
 * is the part a caller cannot see: which URL each one hits, and how the two
 * different failure shapes the API uses — a JSON `{ error }` body from v2, an
 * empty body from the v1 reset endpoint — turn into something the forms can
 * render. The paths matter because they are relative on purpose: `src/proxy.ts`
 * only rewrites `/api/*`, and only a rewrite keeps the session cookie on this
 * site's origin.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAccount,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
} from "./index";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn(() => Promise.resolve(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

/** A `fetch` that rejects the way an offline browser does. */
const mockOffline = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
  );

/** The (url, init) pair the code under test handed to `fetch`. */
const requestOf = (fetchMock: ReturnType<typeof mockFetch>) => {
  const [url, init] = fetchMock.mock.calls[0] as unknown as [
    string,
    RequestInit | undefined,
  ];
  return { url, init };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("signIn", () => {
  it("posts credentials to the site-scoped v2 endpoint", async () => {
    const fetchMock = mockFetch(
      jsonResponse({
        session: {
          access_token: "a",
          refresh_token: "r",
          expires_in: 3600,
          token_type: "bearer",
        },
        user: { id: "user-id", email: "someone@example.com" },
      }),
    );

    const result = await signIn("sample", {
      email: "someone@example.com",
      password: "hunter22",
    });

    const { url, init } = requestOf(fetchMock);
    expect(url).toBe("/api/v2/sample/public/auth/signin");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "someone@example.com",
      password: "hunter22",
    });
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        user: { id: "user-id", email: "someone@example.com" },
      }),
    });
  });

  it("surfaces the API's message on rejected credentials", async () => {
    mockFetch(jsonResponse({ error: "Invalid login credentials" }, 401));

    const result = await signIn("sample", {
      email: "someone@example.com",
      password: "wrong",
    });

    expect(result).toEqual({ ok: false, error: "Invalid login credentials" });
  });

  it("reports a failure with no message when the body is not JSON", async () => {
    // A gateway between the browser and the API can answer with HTML. There is
    // no message to show, and inventing an English one here would bypass the
    // dictionaries — so the form is told to supply its own.
    mockFetch(new Response("<html>nope</html>", { status: 502 }));

    const result = await signIn("sample", {
      email: "someone@example.com",
      password: "hunter22",
    });

    expect(result).toEqual({ ok: false, error: null });
  });

  it("returns a failure rather than throwing when the request never lands", async () => {
    // These run inside `startTransition`, so a rejected fetch escaping as a
    // throw would reach the nearest error boundary and take the page down
    // instead of putting a message in the dialog.
    mockOffline();

    const result = await signIn("sample", {
      email: "someone@example.com",
      password: "hunter22",
    });

    expect(result).toEqual({ ok: false, error: null });
  });

  it("treats an empty success body as a success", async () => {
    // Only the status says whether the call worked; a 2xx with nothing in it
    // must not be reported to the visitor as a failure.
    mockFetch(new Response(null, { status: 204 }));

    expect(await signOut("sample")).toEqual({ ok: true, data: {} });
  });

  it("escapes the site key into the path", async () => {
    const fetchMock = mockFetch(jsonResponse({ session: {}, user: {} }));

    await signIn("a site", { email: "a@b.co", password: "hunter22" });

    expect(requestOf(fetchMock).url).toBe(
      "/api/v2/a%20site/public/auth/signin",
    );
  });
});

describe("signUp", () => {
  it("posts to the signup endpoint", async () => {
    const fetchMock = mockFetch(
      jsonResponse({ user: { id: "user-id" }, confirmEmail: true }),
    );

    const result = await signUp("sample", {
      email: "someone@example.com",
      password: "hunter22",
    });

    expect(requestOf(fetchMock).url).toBe("/api/v2/sample/public/auth/signup");
    expect(result).toEqual({
      ok: true,
      data: { user: { id: "user-id" }, confirmEmail: true },
    });
  });

  it("passes through the refusal when the site has signups turned off", async () => {
    // Signups are opt-in per site, so this 403 is an ordinary answer the form
    // has to show rather than an error to swallow.
    mockFetch(
      jsonResponse({ error: "Signups are not allowed for this site" }, 403),
    );

    const result = await signUp("sample", {
      email: "someone@example.com",
      password: "hunter22",
    });

    expect(result).toEqual({
      ok: false,
      error: "Signups are not allowed for this site",
    });
  });
});

describe("signOut", () => {
  it("posts to the signout endpoint with no credentials", async () => {
    const fetchMock = mockFetch(jsonResponse({ success: true }));

    const result = await signOut("sample");

    const { url, init } = requestOf(fetchMock);
    expect(url).toBe("/api/v2/sample/public/auth/signout");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({});
    expect(result).toEqual({ ok: true, data: { success: true } });
  });
});

describe("getAccount", () => {
  it("reads the first record out of the me endpoint", async () => {
    const fetchMock = mockFetch(
      jsonResponse({
        records: [{ name: "Ada", roles: [{ name: "member" }] }],
      }),
    );

    const account = await getAccount("sample");

    expect(requestOf(fetchMock).url).toBe("/api/v1/sample/public/me");
    expect(account).toEqual({ name: "Ada", roles: [{ name: "member" }] });
  });

  it("reports no account when the visitor has no session", async () => {
    // The endpoint answers 200 with an empty list rather than a 401, so an empty
    // `records` is the signed-out signal.
    mockFetch(jsonResponse({ records: [] }));

    expect(await getAccount("sample")).toBeNull();
  });

  it("reports no account when the request fails", async () => {
    mockFetch(jsonResponse({ error: "boom" }, 500));

    expect(await getAccount("sample")).toBeNull();
  });

  it("defaults roles so callers can list them unconditionally", async () => {
    mockFetch(jsonResponse({ records: [{ name: "Ada" }] }));

    expect(await getAccount("sample")).toEqual({ name: "Ada", roles: [] });
  });

  it("still reports an account when the record has no name", async () => {
    // Signing up through the site sets no name, and reading that as "no
    // session" would leave the visitor permanently unable to appear logged in.
    mockFetch(jsonResponse({ records: [{ roles: [{ name: "member" }] }] }));

    expect(await getAccount("sample")).toEqual({
      name: "",
      roles: [{ name: "member" }],
    });
  });

  it("reports no account rather than throwing when the request never lands", async () => {
    mockOffline();

    expect(await getAccount("sample")).toBeNull();
  });

  it("does not let a cached copy answer for the session", async () => {
    // Which visitor this is comes from a cookie, so a reused response could
    // report someone who has since signed out.
    const fetchMock = mockFetch(jsonResponse({ records: [] }));

    await getAccount("sample");

    expect(requestOf(fetchMock).init).toMatchObject({ cache: "no-store" });
  });
});

describe("requestPasswordReset", () => {
  it("sends the email as form data and points the link back at this site", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 200 }));

    const accepted = await requestPasswordReset({
      email: "someone@example.com",
      origin: "https://example.com",
    });

    const { url, init } = requestOf(fetchMock);
    const { searchParams, pathname } = new URL(url, "https://example.com");

    expect(pathname).toBe("/api/auth/resetPassword");
    // The emailed link opens the VenueCMS-hosted change-password screen, which
    // needs `origin` to send the visitor home afterwards.
    expect(searchParams.get("redirectUrl")).toBe(
      "https://app.venuecms.com/account/changePassword",
    );
    expect(searchParams.get("origin")).toBe("https://example.com");

    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("email")).toBe("someone@example.com");
    expect(accepted).toBe(true);
  });

  it("reports the rejection when the API will not send the email", async () => {
    // This endpoint answers with an empty body either way, so status is all
    // there is to go on.
    mockFetch(new Response(null, { status: 422 }));

    expect(
      await requestPasswordReset({
        email: "someone@example.com",
        origin: "https://example.com",
      }),
    ).toBe(false);
  });

  it("reports a rejection rather than throwing when the request never lands", async () => {
    mockOffline();

    expect(
      await requestPasswordReset({
        email: "someone@example.com",
        origin: "https://example.com",
      }),
    ).toBe(false);
  });
});
