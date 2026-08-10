import type { SearchParams } from "@venuecms/sdk-next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProductsListContent } from "./ProductsListContent";

function ProductsListError() {
  return (
    <section className="py-20">
      <p className="text-secondary">
        Unable to load products. Please try refreshing the page.
      </p>
    </section>
  );
}

function ProductsListSkeleton() {
  return (
    <section className="py-20">
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
    </section>
  );
}

export function ProductsListSection({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Passed down whole rather than as a page number, because the pager needs the
   * rest of the query string to link without dropping it — and unawaited, so
   * the wait happens inside the Suspense boundary below rather than in the
   * route above it.
   */
  searchParams: Promise<SearchParams>;
}) {
  return (
    <ErrorBoundary fallback={<ProductsListError />}>
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsListContent locale={locale} searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}
