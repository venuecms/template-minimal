import { Site } from "@venuecms/sdk";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "../VenueImage";

export const SiteLogo = ({
  className,
  site,
}: {
  className?: string;
  site: Site;
}) => {
  const { name, image } = site;

  const headerImage = image ? (
    <VenueImage image={image} className="sm:max-w-[32rem] w-full" />
  ) : null;

  return headerImage ? (
    <Link href="/">{headerImage}</Link>
  ) : (
    <h1 className={cn("text-xl", className)}>
      <Link href="/">{name}</Link>
    </h1>
  );
};
