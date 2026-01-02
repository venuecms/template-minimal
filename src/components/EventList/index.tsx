import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { LocationLink } from "../LocationLink";
import { VenueImage } from "../VenueImage";
import { formatDateRange } from "../utils";
import { ArrowUpRight } from "lucide-react";



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
        "flex flex-col gap-x-8 sm:grid sm:grid-flow-row sm:grid-cols-1",
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
        "flex break-inside-avoid flex-col text-lg gap-8 pt-4 pb-4 sm:gap-0 border-b border-muted first:pt-0 last:border-0",
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
      <div className="group/event flex flex-col hover:brightness-150">
        <div className="flex flex-row gap-4">
          {event.startDate ? (
            <div className="">
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
            <div className={cn("", isCancelled && "line-through")}>
              {event.location && !event.location.isDefault ? (
              <LocationLink location={event.location} />
              ) : null}
            </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className={cn("text-primary", isCancelled && "line-through")}>
            <Link href={`/events/${event.slug}`}>{content.title} </Link>
          </div>
          <div className="hidden group-hover/event:inline"><ArrowUpRight />
          </div>
            {isCancelled ? 
          <div className="text-primary">Cancelled
          </div> : null}  
        </div>
      </div>
    </div>
  );
};
