import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { i18nConfig, routing } from "./lib/i18n";

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("host");

  if (!host) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  request.headers.set("Authorization", `Bearer ${process.env.API_KEY}`);

  // ensure that all API requests carry this site's API key. You don't need this unless you are using client-side API calls.
  if (url.pathname.startsWith("/api/")) {
    let destination = `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://app.venuecms.com"}${url.pathname}`;

    const query = url.searchParams.toString();
    if (query) {
      destination += `?${query}`;
    }

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${process.env.API_KEY}`);
    return NextResponse.rewrite(destination, {
      request: {
        headers,
      },
    });
  }

  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = i18nConfig.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // I18n ROUTING

  // only reroute if locale is missing. Otherwise we want to use the domain routing
  if (pathnameIsMissingLocale) {
    const handleI18nRouting = createMiddleware(routing);

    const response = handleI18nRouting(request);

    return response;
  }

  // SUBDOMAIN ROUTING

  // check the subdomain which we'll use as a the sitekey
  const subdomain = host.split(".")[0];

  // Use the sample site by default so we can render without a siteKey (but also allow this to work even if you haven't edited this file and simply want to pass in an env var)
  // TODO: Here we will resolve custom hostnames. For now a test with a hardcoded hostname.
  const siteKey =
    host === "www.gototradeschool.org"
      ? "tradeschool"
      : subdomain === "localhost" || subdomain === "venuecms"
        ? "sample"
        : subdomain;

  // rewrite with the sitekey as part of the path for caching and to give access to all sub pages
  const localizedURL = new URL(request.url);
  localizedURL.pathname = `${siteKey}${localizedURL.pathname}`;

  return NextResponse.rewrite(localizedURL);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/(.*rss\\.xml)",
    "/((?!node/|auth/|_next/|_static/|_vercel|_axiom/|media/|[\\w-]+\\.\\w+|.*\\..*).*)",
  ],
};
