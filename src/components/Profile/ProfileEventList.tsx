import { cachedGetProfileEvents, cachedGetSite } from "@/lib/utils";

import { EventsList, ListEvent } from "@/components/EventList";
import { Skeleton } from "@/components/ui/Input/Skeleton";

export const ProfileEventList = async ({
  header,
  slug,
  filter,
}: {
  header: string;
  slug: string;
  filter?: { upcoming?: boolean; lt?: number; dir?: "asc" | "desc" };
}) => {
  const [{ data: events }, { data: site }] = await Promise.all([
    cachedGetProfileEvents({ slug, limit: 60, ...filter }),
    cachedGetSite(),
  ]);

  if (!site) {
    return null;
  }

  return events?.records.length ? (
    <div className="flex flex-col pt-12 gap-12">
      <h2 className="text-secondary m-0 py-0">{header}</h2>
      <EventsList>
        {events.records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} />
        ))}
      </EventsList>
    </div>
  ) : null;
};

export const ProfileEventListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="w-1/4" />
      <EventsList>
        {Array.from({ length: numElements }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-[90%]" />
        ))}
      </EventsList>
    </div>
  );
};
