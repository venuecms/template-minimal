"use client";

import { Site, getSite, setConfig } from "@venuecms/sdk";
import { ReactNode, createContext, useEffect, useState } from "react";

export const VenueContext = createContext<Site | undefined>(undefined);

// Instantiates the venue SDK with a siteKey
export const VenueProvider = ({
  siteKey,
  children,
}: {
  siteKey: string;
  children: ReactNode;
}) => {
  const [instance, setInstance] = useState<Site | undefined>();

  useEffect(() => {
    setConfig({
      siteKey,
      options: { baseUrl: "/", next: { revalidate: 60 } },
    });

    getSite().then(({ data }) => setInstance(data));
  }, [siteKey]);

  return (
    <VenueContext.Provider value={instance}>{children}</VenueContext.Provider>
  );
};
