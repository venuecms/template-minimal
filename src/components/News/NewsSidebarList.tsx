"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface NewsSidebarItem {
  slug: string;
  title: string;
}

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
    <nav className="flex flex-col gap-4 text-sm">
      {hasNewer ? (
        <button
          type="button"
          aria-label="Show newer news"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="flex justify-center text-secondary hover:text-primary"
        >
          <ChevronUp className="size-5" />
        </button>
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
        <button
          type="button"
          aria-label="Show older news"
          onClick={() => setPage((p) => p + 1)}
          className="flex justify-center text-secondary hover:text-primary"
        >
          <ChevronDown className="size-5" />
        </button>
      ) : null}
    </nav>
  );
};
