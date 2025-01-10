import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { VenueContent } from "@/lib/utils/renderer";

import { LocationLink } from "../LocationLink";
import { ProfileCompact } from "../ProfileCompact";
import { TicketList } from "../TicketList";
import { VenueImage } from "../VenueImage";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "../layout";
import { formatDate } from "../utils";
import { renderedStyles } from "../utils/styles";

export const Event = ({ event }: { event: VenueEvent }) => {
  const locale = useLocale();
  const { location, artists } = event;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-10">
            <div>
              <div
                className={cn("text-secondary", isCancelled && "line-through")}
              >
                {formatDate(event.startDate, event.site.timeZone!)}
              </div>
              <div>{content.title}</div>
              {location ? <LocationLink location={location} /> : null}
            </div>
            {isCancelled ? (
              <div className="text-secondary">Cancelled</div>
            ) : null}
            {!isCancelled && event.tickets ? (
              <TicketList tickets={event.tickets} />
            ) : null}
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
        <TwoSubColumnLayout>
          {artists.map(({ profile }) => (
            <ProfileCompact key={profile.slug} profile={profile} />
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
