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

/**
 * Exported so /shop's route-level `loading.tsx` draws the same thing this
 * Suspense fallback does — two copies drifted by a padding class is what the
 * route transition and the fallback disagreeing on height looks like.
 */
export function ProductsListSkeleton() {
  return (
    <div className="grid gap-8 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
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
 * The products listing /shop draws: the grid, its pager, and the boundaries
 * they need.
 *
 * This is the component a page gets from a product listing block in its body,
 * which is why it takes no page content of its own and no frame — `ProductsLayout`
 * is the frame, and the route composes the two. A PRODUCTLIST page renders that
 * same layout around its body instead, and never reaches this.
 */
export function ProductsListSection({
  currentPage,
  basePath,
  searchParams,
}: {
  currentPage: number;
  /** Path the pager builds hrefs against; only the route knows it. */
  basePath: string;
  searchParams?: SearchParams;
}) {
  return (
    <ErrorBoundary fallback={<ProductsListError />}>
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsListContent
          currentPage={currentPage}
          basePath={basePath}
          searchParams={searchParams}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
