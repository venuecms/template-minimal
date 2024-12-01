import { Event, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";

import { formatDate } from "../utils";

export const EventsList = ({ events }: { events: Array<Event> }) => {
  return (
    <div className="flex flex-col gap-8 text-sm">
      {events.map((event) => (
        <ListEvent key={event.id} event={event} />
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
      <div>
        <Link href={`/events/${event.slug}`}>{content.title}</Link>
      </div>
      {event.location ? (
        <div className="text-secondary">{locationContent.title}</div>
      ) : null}
    </div>
  );
};
