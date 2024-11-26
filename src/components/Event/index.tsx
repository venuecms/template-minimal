import { type Event as VenueEvent, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { formatDate } from "../utils";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

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
            <div>{formatDate(event.startDate)}</div>
            <div>{content.title}</div>
            {location ? <div>{locationContent.title}</div> : null}
          </div>
          <div className="flex gap-8">
            <div>$25 at the door</div>
            <div>$20 adv</div>
            <div>$10 members</div>
          </div>
        </div>
      </ColumnLeft>

      <ColumnRight>
        <p className="max-w-[42rem] text-sm">{content.content}</p>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
