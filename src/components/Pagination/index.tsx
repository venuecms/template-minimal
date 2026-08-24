import type { SearchParams } from "@venuecms/sdk-next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { buildPageHref } from "@/components/utils/searchParams";

/**
 * The prev/next control itself: two arrows and nothing else.
 *
 * Takes the hrefs already built rather than a page number and a base URL,
 * because its two callers know different things. A listing page knows the route
 * it is on and counts from there; a listing block inside content does not know
 * its own URL at all — the SDK hands it hrefs that preserve the rest of the
 * query string, since a second listing on the same page keeps its own page in
 * a param of its own.
 *
 * A null href is the disabled direction, so "there is no previous page" has one
 * spelling rather than a boolean that can disagree with the href beside it.
 */
export const PaginationLinks = ({
  prevHref,
  nextHref,
  label = "Pagination",
  scroll = true,
  className,
}: {
  prevHref: string | null;
  nextHref: string | null;
  /**
   * The nav landmark's accessible name.
   *
   * Defaulted rather than fixed because a page can now carry several pagers —
   * one per listing block in the content — and landmarks that all announce
   * "Pagination" leave a screen-reader user no way to tell which listing each
   * one moves.
   */
  label?: string;
  /**
   * Whether following a page link scrolls to the top, as Next does by default.
   *
   * True suits a pager that owns its page: `/archive` and `/shop` are the
   * listing, so the new page's first record is what a reader wants in view.
   * A listing block is the exception — it sits inside an article the reader is
   * part-way through, and scrolling to the top there abandons the content they
   * were reading to page a few records inside it.
   */
  scroll?: boolean;
  className?: string;
}) => {
  const renderLink = (
    href: string | null,
    children: ReactNode,
    linkLabel: string,
  ) => {
    // The arrows are icons with no text, so without a name on the link itself
    // there is nothing for a screen reader to announce but the URL.
    if (!href) {
      return (
        <span
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none opacity-50"
        >
          {children}
        </span>
      );
    }

    return (
      <Link href={href} aria-label={linkLabel} scroll={scroll}>
        {children}
      </Link>
    );
  };

  return (
    <nav
      aria-label={label}
      className={cn("mt-8 flex items-center justify-between gap-4", className)}
    >
      {renderLink(prevHref, <ArrowLeft className="size-6" />, "Previous page")}
      {renderLink(nextHref, <ArrowRight className="size-6" />, "Next page")}
    </nav>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  /** Carried through, so paging the page does not reset a listing block in its body. */
  searchParams?: SearchParams;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className,
}: PaginationProps) => {
  if (totalPages < 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const pageHref = (page: number) => buildPageHref(baseUrl, searchParams, page);

  return (
    <PaginationLinks
      prevHref={currentPage <= 0 ? null : pageHref(currentPage - 1)}
      nextHref={currentPage >= totalPages ? null : pageHref(currentPage + 1)}
      className={className}
    />
  );
};
