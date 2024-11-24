import { EventsListing } from "@/components/EventListing";
import { getEvents } from "@venuecms/sdk";

const Home = async () => {
  const [{ data: events }, { data: featuredEvents }] = await Promise.all([
    getEvents({ limit: 6 }),
    getEvents({ limit: 6, featured: true }),
  ]);

  return (
    <main className="py-24 flex flex-col">
      <div className="flex flex-col w-full"></div>
      <div className="flex flex-col gap-12 w-full min-w-[32rem]">
        {events?.records.length ? <EventsListing events={events} /> : null}
      </div>
    </main>
  );
};

export default Home;
