import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export const TwoSubColumnLayout = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      "grid max-w-fit gap-24 sm:grid-cols-[repeat(2,minmax(16rem,32rem))] sm:[&>div]:max-w-96",
      className,
    )}
  >
    {children}
  </div>
);
