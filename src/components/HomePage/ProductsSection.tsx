import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProductsSkeleton } from "./LoadingSkeletons";
import { ProductsError } from "./ErrorFallbacks";
import { ProductsContent } from "./ProductsContent";

export function ProductsSection() {
  return (
    <ErrorBoundary fallback={<ProductsError />}>
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
