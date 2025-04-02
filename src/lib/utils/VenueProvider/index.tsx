"use client";

import { setConfig } from "@venuecms/sdk";
import { ReactNode, createContext, useMemo } from "react";

export const VenueContext = createContext<any>(null);

// Instantiates the venue SDK with a siteKey
export const VenueProvider = ({
  siteKey,
  children,
}: {
  siteKey: string;
  children: ReactNode;
}) => {
  const instance = useMemo(() => {
    setConfig({
      siteKey,
      options: { next: { revalidate: 60 } },
    });
  }, [siteKey]);

  return (
    <VenueContext.Provider value={instance}>{children}</VenueContext.Provider>
  );
};
