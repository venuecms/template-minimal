import { Site } from "@venuecms/sdk-next";
import { VenueImage } from "@venuecms/sdk-next";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    <h1 className={cn("text-nav", className)}>
      <Link href="/">{name}</Link>
    </h1>
  );
};
