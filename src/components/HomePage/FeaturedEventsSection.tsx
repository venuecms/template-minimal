import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { FeaturedEventsSkeleton } from "./LoadingSkeletons";
import { FeaturedEventsError } from "./ErrorFallbacks";
import { FeaturedEventsContent } from "./FeaturedEventsContent";

export function FeaturedEventsSection({
  locale,
  showHeroImage,
  noHeroOverlay,
}: {
  locale: string;
  showHeroImage?: boolean;
  noHeroOverlay?: boolean;
}) {
  return (
    <ErrorBoundary fallback={<FeaturedEventsError />}>
      <Suspense fallback={<FeaturedEventsSkeleton />}>
        <FeaturedEventsContent
          locale={locale}
          showHeroImage={showHeroImage}
          noHeroOverlay={noHeroOverlay}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
