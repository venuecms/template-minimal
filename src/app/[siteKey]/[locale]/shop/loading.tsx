import { ProductsLayout, ProductsListSkeleton } from "@/components/ShopPage";

// The frame and the skeleton the listing itself uses, so the route transition
// and the Suspense fallback behind it cannot disagree about the page's shape.
export default function Loading() {
  return (
    <ProductsLayout>
      <ProductsListSkeleton />
    </ProductsLayout>
  );
}
