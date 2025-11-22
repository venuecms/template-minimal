import { Suspense } from "react";

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
            <div className="aspect-square w-full bg-primary opacity-[3%]" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-1/2 bg-primary opacity-[3%]" />
              <div className="h-4 w-3/4 bg-primary opacity-[3%]" />
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
