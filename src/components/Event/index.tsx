import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { TicketList } from "../TicketList";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { formatDate } from "../utils";

export const Event = ({ event }: { event: VenueEvent }) => {
  const locale = useLocale();
  const { location, artists } = event;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const { content: locationContent } = getLocalizedContent(
    location?.localizedContent,
    locale,
  );

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>
            <div className="text-secondary">{formatDate(event.startDate)}</div>
            <div>{content.title}</div>
            {location ? (
              <div className="text-secondary">{locationContent.title}</div>
            ) : null}
          </div>
          {event.tickets ? <TicketList tickets={event.tickets} /> : null}
          <VenueImage image={event.image} />
        </div>
      </ColumnLeft>

      <ColumnRight>
        <p className="max-w-[42rem] text-sm">{content.content}</p>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
