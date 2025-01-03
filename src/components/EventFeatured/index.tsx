import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { VenueContent } from "@/lib/utils/renderer";

import { TicketList } from "../TicketList";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { formatDate } from "../utils";
import { renderedStyles } from "../utils/styles";

export const EventFeatured = ({
  event,
  className,
}: {
  event: VenueEvent;
  className?: string;
}) => {
  const locale = useLocale();
  const { location } = event;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const { content: locationContent } = getLocalizedContent(
    location?.localizedContent,
    locale,
  );

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
              {formatDate(event.startDate, event.site.timeZone!)}
            </Link>
          </div>
          <div className="text-primary text-xl">
            <Link href={`/events/${event.slug}`}>{content.title}</Link>
          </div>
          {location ? (
            <div className="text-secondary text-2xl">
              {locationContent.title}
            </div>
          ) : null}

          {event.tickets ? <TicketList tickets={event.tickets} /> : null}
          <Link href={`/events/${event.slug}`}>
            <VenueContent
              className="flex flex-col gap-6 max-w-xl"
              content={content}
              contentStyles={renderedStyles}
            />
          </Link>
        </ColumnRight>
      </TwoColumnLayout>
      <div className="sm:hidden flex">
        <div className="flex flex-col gap-8">
          <div>
            <div className="text-secondary">
              <Link href={`/events/${event.slug}`}>
                {formatDate(event.startDate, event.site.timeZone!)}
              </Link>
            </div>
            {location ? (
              <div className="text-secondary">{locationContent.title}</div>
            ) : null}
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
