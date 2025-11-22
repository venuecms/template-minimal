import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export function FeaturedEventsSkeleton() {
  return (
    <div className="flex flex-col pb-16">
      {/* Desktop layout */}
      <TwoColumnLayout className="hidden">
        <ColumnLeft>
          <div className="aspect-square w-full bg-primary opacity-[3%]" />
        </ColumnLeft>
        <ColumnRight className="max-w-4xl gap-16">
          <div className="h-4 w-48 bg-primary opacity-[3%]" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-3/4 bg-primary opacity-[3%]" />
            <div className="h-5 w-1/2 bg-primary opacity-[3%]" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full bg-primary opacity-[3%]" />
            <div className="h-4 w-full bg-primary opacity-[3%]" />
            <div className="h-4 w-2/3 bg-primary opacity-[3%]" />
          </div>
        </ColumnRight>
      </TwoColumnLayout>

      {/* Mobile layout */}
      <div className="flex sm:hidden">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="h-4 w-48 bg-primary opacity-[3%]" />
            <div className="h-4 w-32 bg-primary opacity-[3%]" />
          </div>
          <div className="h-6 w-3/4 bg-primary opacity-[3%]" />
          <div className="aspect-square w-full bg-primary opacity-[3%]" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full bg-primary opacity-[3%]" />
            <div className="h-4 w-full bg-primary opacity-[3%]" />
            <div className="h-4 w-2/3 bg-primary opacity-[3%]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-full bg-primary opacity-[3%]" />
          <div className="h-4 w-full bg-primary opacity-[3%]" />
          <div className="h-4 w-3/4 bg-primary opacity-[3%]" />
        </div>
      </ColumnLeft>
      <ColumnRight>
        <EventsList>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-8 pb-8 sm:gap-0">
              <div className="flex flex-col gap-1">
                <div className="h-4 w-32 bg-primary opacity-[3%]" />
                <div className="h-4 w-48 bg-primary opacity-[3%]" />
                <div className="h-4 w-24 bg-primary opacity-[3%]" />
              </div>
            </div>
          ))}
        </EventsList>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function ProductsSkeleton() {
  return (
    <section className="py-20">
      <div className="pb-8">
        <div className="h-4 w-16 bg-primary opacity-[3%]" />
      </div>

      <div className="grid grid-cols-2 gap-8 pb-20 sm:max-w-full sm:grid-cols-4 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square w-full bg-primary opacity-[3%]" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-1/2 bg-primary opacity-[3%]" />
              <div className="h-4 w-3/4 bg-primary opacity-[3%]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
