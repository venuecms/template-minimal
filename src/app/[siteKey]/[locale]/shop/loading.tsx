import { Skeleton } from "@/components/ui/Input/Skeleton";

export default function Loading() {
  return (
    <section className="py-20">
      <div className="grid gap-8 pb-20 sm:max-w-full lg:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-square" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
