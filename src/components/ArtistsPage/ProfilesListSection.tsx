import { Suspense } from "react";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProfilesListContent } from "./ProfilesListContent";

function ProfilesListError() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary" />
      <ColumnRight>
        <p className="text-secondary">
          Unable to load artists. Please try refreshing the page.
        </p>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

function ProfilesListSkeleton() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <div className="pb-8">
          <Skeleton className="w-32" />
        </div>
      </ColumnLeft>
      <ColumnRight>
        <div className="grid max-w-fit gap-24 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-6">
              <Skeleton className="aspect-video w-full sm:w-80" />
              <Skeleton className="w-32" />
              <Skeleton className="w-48" />
            </div>
          ))}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

/**
 * The canonical profile listing: the artist grid with its skeleton and error
 * states. Shared by the /artists route and any page with type "PROFILELIST".
 */
export function ProfilesListSection({
  locale,
  currentPage,
  slug,
  baseUrl,
}: {
  locale: string;
  currentPage: number;
  /** The page record backing this listing, for its title. */
  slug: string;
  /** The route this listing is mounted at, for the pager's hrefs. */
  baseUrl: string;
}) {
  return (
    <ErrorBoundary fallback={<ProfilesListError />}>
      <Suspense fallback={<ProfilesListSkeleton />}>
        <ProfilesListContent
          locale={locale}
          currentPage={currentPage}
          slug={slug}
          baseUrl={baseUrl}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
