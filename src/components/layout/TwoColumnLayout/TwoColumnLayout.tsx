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
        "py-6 lg:py-24 flex flex-col lg:flex-row justify-between w-full lg:gap-40 lg:grid lg:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
};
