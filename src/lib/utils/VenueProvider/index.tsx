"use client";

import { Site, getSite, setConfig } from "@venuecms/sdk-next";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const VenueContext = createContext<Site | undefined>(undefined);

/**
 * The siteKey of the site being rendered, from the route.
 *
 * Available on the first render, unlike `VenueContext`, which waits on a fetch.
 * Client code that has to name the site to a server action reads it here
 * rather than from the SDK's configured key, which is a module-level global
 * shared by every site one server is rendering.
 */
const SiteKeyContext = createContext<string | undefined>(undefined);

export const useSiteKey = () => useContext(SiteKeyContext);

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
    <SiteKeyContext.Provider value={siteKey}>
      <VenueContext.Provider value={instance}>{children}</VenueContext.Provider>
    </SiteKeyContext.Provider>
  );
};
