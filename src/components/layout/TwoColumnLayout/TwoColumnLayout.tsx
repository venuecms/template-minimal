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
        "py-6 lg:py-24 flex flex-col lg:flex-row justify-between w-full lg:gap-36 lg:grid grid-cols-3",
        className,
      )}
      style={{ gridTemplateColumns: "minmax(24rem, 1fr) 1fr 1fr" }}
    >
      {children}
    </div>
  );
};
