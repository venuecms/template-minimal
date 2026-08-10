/**
 * next-intl's client navigation reaches for `next/navigation`, which pnpm does
 * not link into its isolated tree. Only what is imported under test is needed —
 * nothing here navigates.
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
 * A route component reaches for this when its site lookup comes back empty.
 * Throwing matches how Next unwinds the render, so a test that trips it fails
 * loudly rather than rendering on past a missing site.
 */
export const notFound = (): never => {
  throw new Error("notFound() called");
};
