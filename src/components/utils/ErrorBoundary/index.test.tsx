/**
 * The boundary has to let Next's own throws past.
 *
 * `notFound()` is how every listing here reports a missing site, and it works by
 * throwing. A client boundary that catches it renders its "unable to load"
 * fallback where the 404 page belongs — the listings under /shop, /events,
 * /artists and /p/<slug> all sit inside one. Next's own boundaries carry the
 * same re-throw for the same reason.
 *
 * Asserted against `getDerivedStateFromError` directly rather than through a
 * render: React's server renderer never invokes a class boundary at all — it
 * switches the enclosing Suspense boundary to client rendering and the boundary
 * runs there — so a `renderToReadableStream` test would pass whatever this
 * method did.
 *
 * The digests are pinned against the real framework rather than string
 * literals: they are not public API, and a Next upgrade that renames one has to
 * fail here rather than quietly turn 404s back into 200s. `navigation
 * .react-server` is imported for that because `next/navigation` is aliased to a
 * stub for the whole suite.
 */
import {
  notFound,
  redirect,
} from "next/dist/client/components/navigation.react-server";
import { describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from ".";
import { isNextControlFlowError } from "./nextControlFlow";

const thrownBy = (fn: () => void): Error => {
  try {
    fn();
  } catch (error) {
    return error as Error;
  }

  throw new Error("expected the call to throw");
};

describe("isNextControlFlowError", () => {
  it("recognises what notFound() actually throws", () => {
    expect(isNextControlFlowError(thrownBy(notFound))).toBe(true);
  });

  it("recognises what redirect() actually throws", () => {
    expect(isNextControlFlowError(thrownBy(() => redirect("/elsewhere")))).toBe(
      true,
    );
  });

  it("leaves a real failure alone", () => {
    expect(isNextControlFlowError(new Error("the network is down"))).toBe(
      false,
    );
    expect(isNextControlFlowError(undefined)).toBe(false);
    // A digest alone is not a Next signal: React puts one on every error it
    // serialises across the server boundary.
    expect(isNextControlFlowError({ digest: "1234567890" })).toBe(false);
  });
});

describe("ErrorBoundary", () => {
  it("takes the fallback state for a real failure", () => {
    const error = new Error("the network is down");

    expect(ErrorBoundary.getDerivedStateFromError(error)).toEqual({ error });
  });

  it("re-throws a notFound so the route can answer 404", () => {
    const error = thrownBy(notFound);

    expect(() => ErrorBoundary.getDerivedStateFromError(error)).toThrow(error);
  });

  it("re-throws a redirect", () => {
    const error = thrownBy(() => redirect("/elsewhere"));

    expect(() => ErrorBoundary.getDerivedStateFromError(error)).toThrow(error);
  });

  it("does not log a passed-through notFound as a caught failure", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const boundary = new ErrorBoundary({ children: null });

    boundary.componentDidCatch(thrownBy(notFound), { componentStack: "" });
    expect(consoleError).not.toHaveBeenCalled();

    boundary.componentDidCatch(new Error("the network is down"), {
      componentStack: "",
    });
    expect(consoleError).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
