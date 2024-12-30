import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { VenueContent } from "@/lib/utils/renderer";

import { ProfileCompact } from "../ProfileCompact";
import { TicketList } from "../TicketList";
import { VenueImage } from "../VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";
import { formatDate } from "../utils";
import { renderedStyles } from "../utils/styles";

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
        <VenueContent
          className="flex flex-col gap-6 pr-32"
          content={content}
          contentStyles={renderedStyles}
        />
        <div className="grid-cols-2 grid gap-24">
          {artists.map(({ profile }) => (
            <ProfileCompact key={profile.slug} profile={profile} />
          ))}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
