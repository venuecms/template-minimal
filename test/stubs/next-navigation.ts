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

/** Recognisable throw so a test can tell a bailout from an empty render. */
export const notFound = (): never => {
  throw new Error("NEXT_NOT_FOUND");
};
