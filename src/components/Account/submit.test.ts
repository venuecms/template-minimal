/**
 * What submitting the credentials form leads to.
 *
 * The three outcomes are not symmetric: logging in either works or reports why
 * it did not, while signing up has a third ending where the account exists but
 * the site wants the address confirmed first — and treating that as success
 * would close the dialog on a visitor who still has no session, while treating
 * it as failure would tell them their signup did not work when it did.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveSubmit, submitCredentials } from "./submit";

const credentials = { email: "someone@example.com", password: "hunter22" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const mockFetch = (response: Response) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response)),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitCredentials", () => {
  it("reports a session after a good login", async () => {
    mockFetch(jsonResponse({ session: {}, user: { id: "user-id" } }));

    expect(await submitCredentials("login", "sample", credentials)).toEqual({
      kind: "signed-in",
    });
  });

  it("passes the rejection message back for a bad login", async () => {
    mockFetch(jsonResponse({ error: "Invalid login credentials" }, 401));

    expect(await submitCredentials("login", "sample", credentials)).toEqual({
      kind: "error",
      message: "Invalid login credentials",
    });
  });

  it("reports a session when a signup lands one straight away", async () => {
    mockFetch(jsonResponse({ user: { id: "user-id" }, confirmEmail: false }));

    expect(await submitCredentials("signup", "sample", credentials)).toEqual({
      kind: "signed-in",
    });
  });

  it("asks the visitor to confirm when the signup has no session yet", async () => {
    mockFetch(jsonResponse({ user: { id: "user-id" }, confirmEmail: true }));

    expect(await submitCredentials("signup", "sample", credentials)).toEqual({
      kind: "confirm-email",
    });
  });

  it("passes the refusal back when the site has signups turned off", async () => {
    mockFetch(
      jsonResponse({ error: "Signups are not allowed for this site" }, 403),
    );

    expect(await submitCredentials("signup", "sample", credentials)).toEqual({
      kind: "error",
      message: "Signups are not allowed for this site",
    });
  });

  it("posts to the endpoint the mode names", async () => {
    // The two modes differ only in where they post, so a crossed wire here
    // would log people in from the sign-up screen and vice versa.
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(jsonResponse({ session: {}, user: { id: url } })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await submitCredentials("login", "sample", credentials);
    await submitCredentials("signup", "sample", credentials);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/v2/sample/public/auth/signin",
      "/api/v2/sample/public/auth/signup",
    ]);
  });
});

describe("resolveSubmit", () => {
  it("closes the dialog when signing in produced a session", () => {
    expect(resolveSubmit({ kind: "signed-in" }, true)).toEqual({
      kind: "close",
    });
  });

  it("explains it rather than closing when the session did not stick", () => {
    // A 200 means the API set the cookie, not that the browser kept it.
    // Closing here would drop the visitor on a nav that still says "Log in".
    expect(resolveSubmit({ kind: "signed-in" }, false)).toEqual({
      kind: "error",
      message: { key: "session_failed" },
    });
  });

  it("shows the confirm-email notice without looking for a session", () => {
    expect(resolveSubmit({ kind: "confirm-email" }, false)).toEqual({
      kind: "notice",
      message: { key: "confirm_email" },
    });
  });

  it("passes the API's own words through", () => {
    // The API answers in English only; re-wording it would lose the reason.
    expect(
      resolveSubmit(
        { kind: "error", message: "Invalid login credentials" },
        false,
      ),
    ).toEqual({
      kind: "error",
      message: { text: "Invalid login credentials" },
    });
  });

  it("names a translatable message when the API sent none", () => {
    expect(resolveSubmit({ kind: "error", message: null }, false)).toEqual({
      kind: "error",
      message: { key: "request_failed" },
    });
  });
});
