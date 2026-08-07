/**
 * next-intl's client navigation reaches for `next/navigation`, which pnpm does
 * not link into its isolated tree. Only the two hooks it imports are needed —
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
