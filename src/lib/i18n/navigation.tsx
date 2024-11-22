import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { PropsWithChildren } from "react";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en"],

  // Used when no locale matches
  defaultLocale: "en",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
const {
  Link: NavLink,
  redirect,
  usePathname,
  useRouter,
} = createNavigation(routing);

const Link = ({ children, ...props }: PropsWithChildren) => {
  return (
    // @ts-ignore
    <NavLink {...props} prefetch={true}>
      {children}
    </NavLink>
  );
};

export { Link, redirect, usePathname, useRouter };
