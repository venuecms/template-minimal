import { GetEventsResponse } from "@venuecms/sdk";

export const EventsListing = ({ events }: { events: GetEventsResponse }) => {
  return (
    <div className="flex flex-col gap-8 text-sm">
      {events.records.map((event) => (
        <div className="flex flex-col">
          <div className="text-secondary">{event.startDate}</div>
          <div>{event.localizedContent[0].title}</div>
          {event.location ? (
            <div className="text-secondary">
              {event.location.localizedContent[0].title}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
