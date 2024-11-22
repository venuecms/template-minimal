import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const SiteLogo = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => {
  return <h1 className={cn("text-xl", className)}>{children}</h1>;
};
