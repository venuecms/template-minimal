import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";

export default function Loading() {
  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <Skeleton className="w-48" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="w-32" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
          <Skeleton className="aspect-video" />
        </div>
      </ColumnLeft>

      <ColumnRight className="max-w-4xl">
        <div className="flex flex-col gap-6 sm:pr-32">
          <Skeleton />
          <Skeleton />
          <Skeleton className="w-3/4" />
          <Skeleton />
          <Skeleton className="w-5/6" />
        </div>
        <TwoSubColumnLayout>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square" />
              <Skeleton className="w-3/4" />
            </div>
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
}
