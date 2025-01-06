import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "../VenueImage";
import { formatDate } from "../utils";

export const EventsList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:grid sm:grid-cols-2 sm:grid-flow-row gap-x-8 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const ListEvent = ({
  event,
  site,
  withImage,
  className,
}: {
  event: Event;
  site: Site;
  withImage?: boolean;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const { content: locationContent } = getLocalizedContent(
    event?.location?.localizedContent,
    locale,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-8 sm:gap-0 pb-8 break-inside-avoid",
        className,
      )}
    >
      {withImage ? (
        <div className={cn("w-full sm:w-80 sm:max-w-full pb-3")}>
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} aspect="video" />
          </Link>
        </div>
      ) : null}
      <div className="flex flex-col">
        {event.startDate ? (
          <div className="text-secondary">
            <Link href={`/events/${event.slug}`}>
              {formatDate(event.startDate, site.timeZone!)}
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
