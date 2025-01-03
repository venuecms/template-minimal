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
    <div className="flex flex-col gap-8 sm:gap-0 pb-8 break-inside-avoid">
      {withImage ? (
        <div className="w-full sm:w-60 pb-3">
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} aspect="video" />
          </Link>
        </div>
      ) : null}
      <div className="flex flex-col">
        {event.startDate ? (
          <div className="text-secondary">
            <Link href={`/events/${event.slug}`}>
              {formatDate(event.startDate, event.site.timeZone!)}
            </Link>
          </div>
        ) : null}
        <div className="text-primary">
          <Link href={`/events/${event.slug}`}>{content.title}</Link>
        </div>
        {event.location ? (
          <div className="text-secondary">{locationContent.title}</div>
        ) : null}
      </div>
    </div>
  );
};
