import {
  type Site,
  type Event as VenueEvent,
  getLocalizedContent,
} from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { VenueContent } from "@/lib/utils/renderer";

import { LocationLink } from "../LocationLink";
import { TicketList } from "../TicketList";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { formatDate } from "../utils";
import { renderedStyles } from "../utils/styles";

export const EventFeatured = ({
  event,
  site,
  className,
}: {
  event: VenueEvent;
  site: Site;
  className?: string;
}) => {
  const locale = useLocale();
  const { location } = event;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";

  return (
    <>
      <TwoColumnLayout className={cn(className, "hidden")}>
        <ColumnLeft>
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} />
          </Link>
        </ColumnLeft>

        <ColumnRight className="max-w-4xl gap-16">
          <div className="text-secondary">
            <Link href={`/events/${event.slug}`}>
              {formatDate(event.startDate, site.timeZone!)}
            </Link>
          </div>
          <div className="text-xl text-primary">
            <Link href={`/events/${event.slug}`}>{content.title}</Link>
            {location ? (
              <LocationLink className="pt-2 text-2xl" location={location} />
            ) : null}
          </div>
          {isCancelled ? <div className="text-secondary">Cancelled</div> : null}
          {!isCancelled && event.tickets ? (
            <TicketList tickets={event.tickets} />
          ) : null}
          <Link href={`/events/${event.slug}`}>
            <VenueContent
              className="flex max-w-xl flex-col gap-6"
              content={content}
              contentStyles={renderedStyles}
            />
          </Link>
        </ColumnRight>
      </TwoColumnLayout>
      <div className="flex sm:hidden">
        <div className="flex flex-col gap-8">
          <div>
            <div className="text-secondary">
              <Link href={`/events/${event.slug}`}>
                {formatDate(event.startDate, site.timeZone!)}
              </Link>
            </div>
            {location ? <LocationLink location={location} /> : null}
          </div>
          <div className="text-xl">
            <Link href={`/events/${event.slug}`}>{content.title}</Link>
          </div>
          <Link href={`/events/${event.slug}`}>
            <VenueImage image={event.image} />
          </Link>
          <div className="text-xl">
            <Link href={`/events/${event.slug}`}>
              <VenueContent content={content} contentStyles={renderedStyles} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
