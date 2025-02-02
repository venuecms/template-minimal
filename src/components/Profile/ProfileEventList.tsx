import { getProfileEvents, getSite } from "@venuecms/sdk";

import { EventsList, ListEvent } from "@/components/EventList";

export const ProfileEventList = async ({
  header,
  slug,
  filter,
}: {
  header: string;
  slug: string;
  filter?: { upcoming?: boolean; lt?: number };
}) => {
  const [{ data: events }, { data: site }] = await Promise.all([
    getProfileEvents({ slug, ...filter }),
    getSite(),
  ]);

  if (!site) {
    return null;
  }

  return events?.records.length ? (
    <div className="flex flex-col gap-6">
      <h2 className="m-0 py-0 text-sm text-primary">{header}</h2>
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
      <div className="h-4 w-1/4 bg-primary opacity-[3%]" />
      <EventsList>
        {Array.from({ length: numElements }).map((_, index) => (
          <div key={index} className="h-16 w-[90%] bg-primary opacity-[3%]" />
        ))}
      </EventsList>
    </div>
  );
};
