import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";

export default function Loading() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <div className="pb-8">
          <Skeleton className="w-32" />
        </div>
      </ColumnLeft>
      <ColumnRight>
        <EventsList className="gap-y-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-3 pb-8">
              <Skeleton className="aspect-video w-full sm:w-80" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-32" />
                <Skeleton className="w-48" />
                <Skeleton className="w-24" />
              </div>
            </div>
          ))}
        </EventsList>
      </ColumnRight>
    </TwoColumnLayout>
  );
}
