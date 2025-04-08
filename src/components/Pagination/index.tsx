import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const renderLink = (
    page: number,
    children: ReactNode,
    isDisabled = false,
  ) => {
    const href = `${baseUrl}?page=${page}`;
    const linkClassName = cn(
      "px-3 py-1 border rounded hover:bg-muted",
      isDisabled && "pointer-events-none text-muted-foreground opacity-50",
    );

    if (isDisabled) {
      return <span className={linkClassName}>{children}</span>;
    }

    return (
      <Link href={href} className={linkClassName}>
        {children}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-8 flex items-center justify-center gap-4", className)}
    >
      {renderLink(currentPage - 1, "Previous", currentPage <= 0)}
      <span className="text-muted-foreground text-sm">
        Page {currentPage + 1} of {totalPages}
      </span>
      {renderLink(currentPage + 1, "Next", currentPage >= totalPages)}
    </nav>
  );
};
