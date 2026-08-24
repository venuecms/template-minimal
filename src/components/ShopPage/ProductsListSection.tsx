import type { SearchParams } from "@venuecms/sdk-next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProductsListContent } from "./ProductsListContent";

function ProductsListError() {
  return (
    <p className="text-secondary">
      Unable to load products. Please try refreshing the page.
    </p>
  );
}

function ProductsListSkeleton() {
  return (
    <div className="grid gap-8 pb-20 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The frame of the products listing, shared by /shop and by a PRODUCTLIST page.
 *
 * The page's own body sits *outside* the boundaries on purpose. It is already
 * in hand and costs no request, so putting it under the Suspense would hide
 * readable content behind the grid's skeleton and shift the layout when it
 * resolved, and putting it under the ErrorBoundary would delete an author's
 * prose because an unrelated fetch failed.
 */
export function ProductsListSection({
  currentPage,
  basePath,
  searchParams,
  children,
}: {
  currentPage: number;
  basePath: string;
  searchParams?: SearchParams;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-20">
      {children ? <div className="pb-20">{children}</div> : null}
      <ErrorBoundary fallback={<ProductsListError />}>
        <Suspense fallback={<ProductsListSkeleton />}>
          <ProductsListContent
            currentPage={currentPage}
            basePath={basePath}
            searchParams={searchParams}
          />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
