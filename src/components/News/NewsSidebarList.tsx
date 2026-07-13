"use client";

import { useState } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface NewsSidebarItem {
  slug: string;
  title: string;
}

const PagerButton = ({
  label,
  glyph,
  onClick,
}: {
  label: string;
  glyph: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex justify-center text-secondary hover:text-primary lg:justify-start"
  >
    {glyph}
  </button>
);

export const NewsSidebarList = ({
  items,
  currentSlug,
  initialPage,
  pageSize,
}: {
  items: NewsSidebarItem[];
  currentSlug?: string;
  initialPage: number;
  pageSize: number;
}) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const [page, setPage] = useState(Math.min(initialPage, totalPages - 1));

  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);
  const hasNewer = page > 0;
  const hasOlder = page < totalPages - 1;

  return (
    <nav className="flex flex-col items-center gap-4 text-sm lg:items-start">
      {hasNewer ? (
        <PagerButton
          label="Show newer news"
          glyph="↑"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        />
      ) : null}

      {visible.map((item) => (
        <Link
          key={item.slug}
          href={`/news/${item.slug}`}
          className={cn(
            "hover:text-primary",
            item.slug === currentSlug ? "text-primary" : "text-secondary",
          )}
        >
          {item.title}
        </Link>
      ))}

      {hasOlder ? (
        <PagerButton
          label="Show older news"
          glyph="↓"
          onClick={() => setPage((p) => p + 1)}
        />
      ) : null}
    </nav>
  );
};
