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
        <TwoSubColumnLayout>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-6">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="w-32" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-full" />
                <Skeleton className="w-3/4" />
              </div>
            </div>
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function ProfilesListSection({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<ProfilesListError />}>
      <Suspense fallback={<ProfilesListSkeleton />}>
        <ProfilesListContent title={title}>{children}</ProfilesListContent>
      </Suspense>
    </ErrorBoundary>
  );
}
