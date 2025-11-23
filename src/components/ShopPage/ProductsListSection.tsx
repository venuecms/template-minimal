import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { Skeleton } from "@/components/ui/Input/Skeleton";

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
  currentPage,
}: {
  locale: string;
  currentPage: number;
}) {
  return (
    <ErrorBoundary fallback={<ProductsListError />}>
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsListContent locale={locale} currentPage={currentPage} />
      </Suspense>
    </ErrorBoundary>
  );
}
