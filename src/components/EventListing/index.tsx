import { Event, getLocalizedContent } from "@venuecms/sdk";
import { formatDate } from "../utils";
import { useLocale } from "next-intl";

export const EventsListing = ({ events }: { events: Array<Event> }) => {
  return (
    <div className="flex flex-col gap-8 text-sm">
      {events.map((event) => (
        <ListEvent event={event} />
      ))}
    </div>
  );
};

const ListEvent = ({ event }: { event: Event }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const { content: locationContent } = getLocalizedContent(
    event?.location?.localizedContent,
    locale,
  );

  return (
    <div className="flex flex-col">
      {event.startDate ? (
        <div className="text-secondary">{formatDate(event.startDate)}</div>
      ) : null}
      <div>{content.title}</div>
      {event.location ? (
        <div className="text-secondary">{locationContent.title}</div>
      ) : null}
    </div>
  );
};
