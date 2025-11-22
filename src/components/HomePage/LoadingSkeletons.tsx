export function FeaturedEventsSkeleton() {
  return (
    <div className="flex flex-col pb-16">
      <div className="h-96 w-full animate-pulse bg-gray-200/50 lg:h-[32rem]" />
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="grid h-20 w-full animate-pulse grid-cols-2 gap-4 bg-gray-200/50"
          />
        ))}
      </div>
    </section>
  );
}

export function ProductsSkeleton() {
  return (
    <section className="py-20">
      <div className="mb-4 h-6 w-24 animate-pulse bg-gray-200/50" />
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 w-full animate-pulse bg-gray-200/50" />
        ))}
      </div>
    </section>
  );
}
