import { Location as VenueLocation, getLocalizedContent } from "@venuecms/sdk";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

export const LocationLink = ({
  location,
  className,
}: {
  location: VenueLocation;
  className?: string;
}) => {
  const locale = useLocale();
  const { content: locationContent } = getLocalizedContent(
    location?.localizedContent,
    locale,
  );
  const { mapLink } = location;

  return mapLink ? (
    <a
      href={mapLink}
      target="_blank"
      className={cn("flex gap-2 items-center text-secondary", className)}
    >
      {locationContent.title} <MapPin className="size-4" />
    </a>
  ) : (
    <div className={cn("text-secondary", className)}>
      {locationContent.title}
    </div>
  );
};
