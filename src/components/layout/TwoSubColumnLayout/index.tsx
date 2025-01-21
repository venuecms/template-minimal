import { PropsWithChildren } from "react";

export const TwoSubColumnLayout = ({ children }: PropsWithChildren) => (
  <div className="grid max-w-fit gap-24 sm:grid-cols-[repeat(2,minmax(16rem,32rem))] sm:[&>div]:max-w-96">
    {children}
  </div>
);
