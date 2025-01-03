import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

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
          <VenueImage image={event.image} />
        </ColumnLeft>

        <ColumnRight className="max-w-4xl gap-16">
          <div className="text-secondary">
            {formatDate(event.startDate, event.site.timeZone!)}
          </div>
          <div className="text-primary text-xl">{content.title}</div>
          {location ? (
            <div className="text-secondary text-2xl">
              {locationContent.title}
            </div>
          ) : null}

          {event.tickets ? <TicketList tickets={event.tickets} /> : null}
          <VenueContent
            className="flex flex-col gap-6 sm:pr-32"
            content={content}
            contentStyles={renderedStyles}
          />
        </ColumnRight>
      </TwoColumnLayout>
      <div className="sm:hidden flex">
        <div className="flex flex-col gap-8">
          <div>
            <div className="text-secondary">
              {formatDate(event.startDate, event.site.timeZone!)}
            </div>
            {location ? (
              <div className="text-secondary">{locationContent.title}</div>
            ) : null}
          </div>
          <div className="text-xl">{content.title}</div>
          <VenueImage image={event.image} />
          <div className="text-xl">
            <VenueContent content={content} contentStyles={renderedStyles} />
          </div>
        </div>
      </div>
    </>
  );
};
