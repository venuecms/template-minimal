import { Suspense } from "react";
import type { ReactNode } from "react";

import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { ProfilesListContent } from "./ProfilesListContent";

function ProfilesListError() {
  return (
    <p className="text-secondary">
      Unable to load artists. Please try refreshing the page.
    </p>
  );
}

function ProfilesListSkeleton() {
  return (
    <TwoSubColumnLayout>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-6">
          {/* `h-auto` so tailwind-merge drops Skeleton's own `h-4`, which would
              otherwise win over the aspect ratio and collapse the card to a bar. */}
          <Skeleton className="aspect-video h-auto w-full" />
          <Skeleton className="w-32" />
          <div className="flex flex-col gap-1">
            <Skeleton className="w-full" />
            <Skeleton className="w-3/4" />
          </div>
        </div>
      ))}
    </TwoSubColumnLayout>
  );
}

/**
 * The frame of the profile listing: the /events and /archive two-column index,
 * since this template has no /profiles route of its own to mirror.
 *
 * The heading and the page's own body sit *outside* the boundaries on purpose.
 * Both are already in hand — neither costs a request — so putting them under
 * the Suspense would hide readable content behind the roster's skeleton and
 * shift the layout when it resolved, and putting them under the ErrorBoundary
 * would delete an author's prose because an unrelated fetch failed.
 */
export function ProfilesListSection({
  title,
  children,
}: {
  /**
   * Heading. Always the listing page's own: unlike events and shop, this
   * template has no /profiles route and so no page record to read one from.
   */
  title?: string;
  /** The page's own body, rendered above the records. */
  children?: ReactNode;
}) {
  // Emptiness, not absence: the route reads the title off the page's localized
  // content, which is blank rather than missing for a locale saved without one,
  // and `??` would keep that and draw an empty heading column.
  const heading = title?.trim() ? title : "artists";

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="pb-8 text-primary">{heading}</p>
      </ColumnLeft>
      <ColumnRight>
        {children}
        <ErrorBoundary fallback={<ProfilesListError />}>
          <Suspense fallback={<ProfilesListSkeleton />}>
            <ProfilesListContent />
          </Suspense>
        </ErrorBoundary>
      </ColumnRight>
    </TwoColumnLayout>
  );
}
