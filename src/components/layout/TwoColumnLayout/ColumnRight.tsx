import { cn } from "@/lib/utils";

export const ColumnRight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex flex-col w-full gap-12 col-span-2", className)}
      {...props}
    />
  );
};
