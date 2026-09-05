import {
  type SearchParams,
  Site,
  VenueContent,
  type Event as VenueEvent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

import { contentComponents } from "@/components/ListingBlock";
import { VenueImage } from "@/components/VenueImage";

import { LocationLink } from "../LocationLink";
import { ProfileCompact } from "../ProfileCompact";
import { TicketList } from "../TicketList";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "../layout";
import { formatDateRange } from "../utils";

export const Event = ({
  event,
  site,
  searchParams,
}: {
  event: VenueEvent;
  site: Site;
  /**
   * The route's search params, for the pagers on any listing blocks in this
   * content. Only a route segment can read them, so they are passed down.
   *
   * Required rather than optional: a caller that forgets it costs every listing
   * in this content its pager, and does so silently — the records still render.
   * A surface that genuinely has no URL to page by passes `{}` and says so.
   */
  searchParams: SearchParams;
}) => {
  const locale = useLocale();
  const { location, artists } = event;

  const { content } = getLocalizedContent(event?.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";
  const displayImage =
    event.image ??
    event.relations?.parents?.[0]?.image ??
    artists?.find((artist) => !!artist.profile?.image)?.profile.image;

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-10">
            <div>
              <div
                className={cn("text-secondary", isCancelled && "line-through")}
              >
                {formatDateRange({
                  start: event.startDate,
                  end: event.endDate,
                  withTime: event.hasTime,
                  timeZone: site.timeZone!,
                })}
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
          <VenueImage image={displayImage} />
        </div>
      </ColumnLeft>

      <ColumnRight className="max-w-4xl">
        <VenueContent
          className="flex flex-col gap-6"
          content={content}
          contentStyles={contentComponents}
          searchParams={searchParams}
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
