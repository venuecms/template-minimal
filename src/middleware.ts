import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "./lib/i18n";

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("host");

  console.log("HOST", host);
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

  const handleI18nRouting = createMiddleware(routing);

  // TODO: use this response?
  handleI18nRouting(request);

  // check the subdomain which we'll use as a the sitekey
  const subdomain = host.split(".")[0];

  const siteKey =
    subdomain === "localhost" || subdomain === "venuecms"
      ? "sample"
      : subdomain;
  // Use the sample site by default so we can render without a sitekey (but also allow this to work even if you haven't edited this file and simply want to pass in an env var)

  // rewrite with the sitekey as part of the path for caching and to give access to all sub pages
  const localizedURL = new URL(request.url);
  localizedURL.pathname = `${siteKey}${localizedURL.pathname}`;

  console.log("SITEKEY", siteKey);
  console.log("REWRITE", localizedURL);
  return NextResponse.rewrite(localizedURL);
}

export const config = {
  // Match only internationalized pathnames
  matcher:
    "/((?!node/|auth/|_next/|_static/|_vercel|_axiom/|media/|[\\w-]+\\.\\w+|.*\\..*).*)",
};
