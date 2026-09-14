"use client";

import { Site, getSite, setConfig } from "@venuecms/sdk-next";
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
    // `baseUrl` still matters: `searchSite` is the one read the SDK leaves
    // uncached, so it alone still fetches from the browser and has to go
    // through this origin. Every other read is a "use cache" server reference
    // now and fetches server-side, whatever this says.
    setConfig({ siteKey, options: { baseUrl: "/" } });

    getSite().then(({ data }) => setInstance(data));
  }, [siteKey]);

  return (
    <VenueContext.Provider value={instance}>{children}</VenueContext.Provider>
  );
};
