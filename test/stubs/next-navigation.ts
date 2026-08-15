/**
 * next-intl's client navigation reaches for `next/navigation`, which pnpm does
 * not link into its isolated tree. Only the hooks it imports are needed —
 * nothing under test navigates.
 */
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});

export const usePathname = () => "/";

/**
 * Next's not-found signal.
 *
 * A route or a server component reaches for this when a read comes back empty,
 * so a test that exercises one has to be able to tell "rendered nothing" from
 * "bailed out". Real `notFound()` throws a framework error the router catches;
 * throwing a recognisable one here keeps that distinction without pulling the
 * router in.
 */
export const notFound = (): never => {
  throw new Error("NEXT_NOT_FOUND");
};
