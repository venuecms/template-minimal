import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./lib/i18n";

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);

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

  const response = handleI18nRouting(request);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher:
    "/((?!node/|auth/|_next/|_static/|_vercel|_axiom/|media/|[\\w-]+\\.\\w+|.*\\..*).*)",
};
