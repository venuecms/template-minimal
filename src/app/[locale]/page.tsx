import { EventsListing } from "@/components/EventListing";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { getEvents, getPages, getSite } from "@venuecms/sdk";

const Home = async () => {
  const [{ data: site }, { data: events }, { data: featuredEvents }] =
    await Promise.all([
      getSite(),
      getEvents({ limit: 6 }),
      getEvents({ limit: 6, featured: true }),
    ]);

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p>{site?.description}</p>
      </ColumnLeft>
      <ColumnRight>
        {events?.records.length ? (
          <EventsListing events={events.records} />
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
};

export default Home;
