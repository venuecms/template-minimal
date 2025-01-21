import { cn } from "@/lib/utils";

export const ColumnRight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("col-span-2 flex w-full flex-col gap-12", className)}
      {...props}
    />
  );
};
