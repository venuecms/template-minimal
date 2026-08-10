import {
  type Site,
  VenueContent,
  type Event as VenueEvent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";

import { LocationLink } from "../LocationLink";
import { TicketList } from "../TicketList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { formatDateRange } from "../utils";
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
              {formatDateRange({
                start: event.startDate,
                end: event.endDate,
                withTime: event.hasTime,
                timeZone: site.timeZone!,
              })}
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
            {/*
              Plain `renderedStyles`, not `contentComponents`: this excerpt is
              wrapped in a Link, and every list component a listing block draws
              renders links of its own. Resolving a listing here would put an
              <a> inside an <a> — invalid HTML the browser reparses and React
              reports as a hydration mismatch — and would cost an extra endpoint
              read on the home page for records nobody could page through.
              ProfileCompact renders a bio the same way, for the same reason.
            */}
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
                {formatDateRange({
                  start: event.startDate,
                  end: event.endDate,
                  withTime: event.hasTime,
                  timeZone: site.timeZone!,
                })}
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
              {/* Inside a Link, as above. */}
              <VenueContent content={content} contentStyles={renderedStyles} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
