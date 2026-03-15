import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { LocationLink } from "../LocationLink";
import { VenueImage } from "../VenueImage";
import { formatDateRange } from "../utils";

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
        "flex flex-col gap-x-8 text-sm sm:grid sm:grid-flow-row sm:grid-cols-2",
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
  withTime = true,
  dateTemplate,
  className,
}: {
  event: Event;
  site: Site;
  withImage?: boolean;
  withTime?: boolean;
  dateTemplate?: string;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(event.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";

  return (
    <div
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        className,
      )}
    >
      {withImage ? (
        <div className={cn("w-full pb-3 sm:w-80 sm:max-w-full")}>
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} aspect="video" />
          </Link>
        </div>
      ) : null}
      <div className="flex flex-col">
        {event.startDate ? (
          <div className="text-secondary">
            <Link href={`/events/${event.slug}`}>
              {formatDateRange({
                start: event.startDate,
                end: event.endDate,
                withTime: withTime && event.hasTime,
                template: dateTemplate,
                timeZone: site.timeZone!,
              })}
            </Link>
          </div>
        ) : null}
        <div className={cn("text-primary hover:brightness-150 text-balance", isCancelled && "line-through")}>
          <Link href={`/events/${event.slug}`}>{content.title}</Link>
        </div>
        {event.location && !event.location.isDefault ? (
          <LocationLink location={event.location} />
        ) : null}
        {isCancelled ? <div className="">Cancelled</div> : null}
      </div>
    </div>
  );
};
