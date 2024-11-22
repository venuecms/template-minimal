import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  request.headers.set("Authorization", `Bearer ${process.env.API_KEY}`);

  // ensure that all API requests carry this site's API key
  if (url.pathname.startsWith("/api/")) {
    let destination = `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.API_ROOT}${url.pathname}`;

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

  const defaultLocale = "en";

  const handleI18nRouting = createMiddleware({
    locales: ["en", "sv"],
    defaultLocale,
  });

  const response = handleI18nRouting(request);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher:
    "/((?!node/|auth/|_next/|_static/|_vercel|_axiom/|media/|[\\w-]+\\.\\w+|.*\\..*).*)",
};