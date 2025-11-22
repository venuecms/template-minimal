export default function Loading() {
  return (
    <section className="py-20">
      <div className="grid gap-8 pb-20 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square w-full bg-primary opacity-[3%]" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-1/2 bg-primary opacity-[3%]" />
              <div className="h-4 w-3/4 bg-primary opacity-[3%]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
