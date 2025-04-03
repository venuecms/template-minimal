import { cn } from "@/lib/utils";

export const ListSkeleton = ({
  numElements = 2,
  className,
}: {
  numElements?: number;
  className?: string;
}) => {
  return Array.from({ length: numElements }).map((_, index) => (
    <Skeleton key={index} className={cn("h-16", className)} />
  ));
};

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("h-4 w-full bg-primary opacity-[3%]", className)} />
  );
};
