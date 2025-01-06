import { PropsWithChildren } from "react";

export const TwoSubColumnLayout = ({ children }: PropsWithChildren) => (
  <div className="grid gap-24 max-w-fit sm:grid-cols-[repeat(2,minmax(16rem,32rem))] sm:[&>div]:max-w-96">
    {children}
  </div>
);
