/**
 * Next signals `notFound()` and `redirect()` by throwing. The throw is control
 * flow, not a failure: the framework catches it above the route and renders the
 * not-found page or serves the redirect.
 *
 * There is no exported type to test against — Next marks these with a `digest`
 * string and keeps the predicate private (`next/dist/client/components/
 * is-next-router-error`), which is internal and not safe to import. So this
 * matches the digest prefixes directly. `NEXT_HTTP_ERROR_FALLBACK;<status>` is
 * what `notFound()` throws as of Next 15; `NEXT_NOT_FOUND` is the older
 * spelling, kept so the check does not silently start passing these through if
 * the template is pinned back.
 *
 * Any boundary between a `notFound()` call and the route has to let these past,
 * or the 404 becomes a 200 with an error message inside it.
 */
const ControlFlowDigests = [
  "NEXT_HTTP_ERROR_FALLBACK",
  "NEXT_NOT_FOUND",
  "NEXT_REDIRECT",
];

export const isNextControlFlowError = (error: unknown): boolean => {
  const digest = (error as { digest?: unknown } | null | undefined)?.digest;

  if (typeof digest !== "string") {
    return false;
  }

  // The digest carries its payload after a semicolon — the status code for a
  // not-found, the destination and mode for a redirect.
  return ControlFlowDigests.includes(digest.split(";")[0]);
};
