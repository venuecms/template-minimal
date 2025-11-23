import {
  FeaturedEventsSkeleton,
  EventsSkeleton,
  ProductsSkeleton,
} from "@/components/HomePage/LoadingSkeletons";

export default function Loading() {
  return (
    <>
      <FeaturedEventsSkeleton />
      <EventsSkeleton />
      <ProductsSkeleton />
    </>
  );
}
