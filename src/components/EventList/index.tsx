import { Event, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";

import { VenueImage } from "../VenueImage";
import { formatDate } from "../utils";

export const EventsList = ({
  events,
  withImage,
}: {
  events: Array<Event>;
  withImage?: boolean;
}) => {
  return (
    <div className="flex flex-col text-sm">
      {events.map((event) => (
        <ListEvent key={event.id} event={event} withImage={withImage} />
      ))}
    </div>
  );
};

const ListEvent = ({
  event,
  withImage,
}: {
  event: Event;
  withImage?: boolean;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const { content: locationContent } = getLocalizedContent(
    event?.location?.localizedContent,
    locale,
  );

  return (
    <div className="flex flex-col pb-8 break-inside-avoid">
      {withImage ? (
        <div className="max-w-60 pb-3">
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} />
          </Link>
        </div>
      ) : null}
      {event.startDate ? (
        <div className="text-secondary">
          <Link href={`/events/${event.slug}`}>
            {formatDate(event.startDate)}
          </Link>
        </div>
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
