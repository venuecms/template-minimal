import { Site } from "@venuecms/sdk-next";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";

export const SiteLogo = ({
  className,
  site,
}: {
  className?: string;
  site: Site;
}) => {
  const { name, image } = site;

  // A website record can carry its own logo, which outranks the site-wide image.
  // Takes the first record, as FeaturedEventsContent and EventsContent both do:
  // the template treats a site's website settings as a singleton, and nothing
  // here knows which of several websites the current request is being served as.
  const logo = site.webSites?.[0]?.logo ?? image;

  const headerImage = logo ? (
    <VenueImage
      image={logo}
      className="h-auto w-auto min-w-8 sm:h-auto sm:max-h-12 sm:w-auto sm:max-w-[32rem]"
    />
  ) : null;

  return headerImage ? (
    <Link href="/">{headerImage}</Link>
  ) : (
    <h1 className={cn("text-nav", className)}>
      <Link href="/">{name}</Link>
    </h1>
  );
};
