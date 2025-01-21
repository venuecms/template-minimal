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
        "flex w-full grid-cols-3 flex-col justify-between gap-12 py-6 lg:grid lg:flex-row lg:gap-36 lg:py-24",
        className,
      )}
    >
      {children}
    </div>
  );
};
