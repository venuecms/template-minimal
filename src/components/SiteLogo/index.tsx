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
    <VenueImage
      image={image}
      className="h-auto w-auto min-w-8 sm:h-auto sm:max-h-12 sm:w-auto sm:max-w-[32rem]"
    />
  ) : null;

  return headerImage ? (
    <Link href="/">{headerImage}</Link>
  ) : (
    <h1 className={cn("text-nav text-lg hover:brightness-150", className)}>
      <Link href="/">{name}</Link>
    </h1>
  );
};
