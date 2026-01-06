import { cachedGetProfileEvents, cachedGetSite } from "@/lib/utils";

import { EventsList, ListEvent } from "@/components/EventList";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

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
   <TwoColumnLayout>
      <ColumnLeft>
      <h2 className=" m-0 py-0">{header}</h2>
      </ColumnLeft>
      <ColumnRight>
         <EventsList>
        {events.records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} />
        ))}
        </EventsList>
      </ColumnRight>
    </TwoColumnLayout>
  ) : null;
};

export const ProfileEventListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <TwoColumnLayout>
      <ColumnRight>
      <Skeleton className="w-1/4" />
      <EventsList>
        {Array.from({ length: numElements }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-[90%]" />
        ))}
      </EventsList>
      </ColumnRight>
  </TwoColumnLayout>
  );
};
