import { cn } from "@/lib/utils";

export const TwoColumnLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-full grid-cols-3 flex-col justify-between py-6 lg:grid lg:flex-row gap-8 sm:gap-12 lg:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
