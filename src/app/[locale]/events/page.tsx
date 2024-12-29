import { getEvents } from "@venuecms/sdk";

import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

const Home = async () => {
  const { data: events } = await getEvents({ limit: 60, upcoming: true });

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="text-primary font-medium">Upcoming Events</p>
      </ColumnLeft>
      <ColumnRight>
        <div className="columns-2 gap-x-8">
          {events?.records.length ? (
            <EventsList events={events.records} withImage />
          ) : (
            "No events found"
          )}
        </div>
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
