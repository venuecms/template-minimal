import { cn } from "@/lib/utils";

export const ColumnLeft = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col w-[32rem]", className)} {...props} />
  );
};
