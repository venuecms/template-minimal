import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProductsError } from "./ErrorFallbacks";
import { ProductsSkeleton } from "./LoadingSkeletons";
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
