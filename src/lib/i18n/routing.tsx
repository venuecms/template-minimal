import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { ComponentProps } from "react";

import { i18nConfig } from "./config";

export const routing = defineRouting(i18nConfig);

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
const {
  Link: NavLink,
  redirect,
  usePathname,
  useRouter,
} = createNavigation(routing);

/**
 * Typed off the component it wraps rather than off `AnchorHTMLAttributes`.
 *
 * The anchor type described the element this renders, not the props this
 * forwards, so every routing prop next-intl accepts — `locale`, `scroll` and
 * the rest — was a type error at the call site and the spread below needed a
 * suppression to compile. Deriving the props instead makes those callable and
 * keeps `href` the localized type next-intl checks, so a bad route is still
 * caught here.
 */
type LinkProps = ComponentProps<typeof NavLink>;

const Link = ({ children, ...props }: LinkProps) => {
  return (
    <NavLink {...props} prefetch={true}>
      {children}
    </NavLink>
  );
};

export { Link, redirect, usePathname, useRouter };
