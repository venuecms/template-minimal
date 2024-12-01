import { EventsList } from "@/components/EventList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { getEvents, getSite } from "@venuecms/sdk";

const Home = async () => {
  const [{ data: site }, { data: events, error }, { data: featuredEvents }] =
    await Promise.all([
      getSite(),
      getEvents({ limit: 6, dir: "asc", upcoming: true }),
      getEvents({ limit: 6, featured: true, dir: "asc" }),
    ]);

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p>{site?.description}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? <EventsList events={events.records} /> : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
