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
          <div className="flex flex-col gap-10">
            <div>
              <div className="text-secondary">
                {formatDate(event.startDate, event.site.timeZone!)}
              </div>
              <div>{content.title}</div>
              {location ? (
                <div className="text-secondary">{locationContent.title}</div>
              ) : null}
            </div>
            {event.tickets ? <TicketList tickets={event.tickets} /> : null}
          </div>
          <VenueImage image={event.image} />
        </div>
      </ColumnLeft>

      <ColumnRight className="max-w-4xl">
        <VenueContent
          className="flex flex-col gap-6 sm:pr-32"
          content={content}
          contentStyles={renderedStyles}
        />
        <div className="grid gap-24 max-w-fit sm:grid-cols-[repeat(2,minmax(16rem,32rem))] sm:[&>div]:max-w-96">
          {artists.map(({ profile }) => (
            <ProfileCompact key={profile.slug} profile={profile} />
          ))}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
