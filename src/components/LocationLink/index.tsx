import { Location as VenueLocation, getLocalizedContent } from "@venuecms/sdk";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const LocationLink = ({
  location,
  className,
}: {
  location: VenueLocation;
  className?: string;
}) => {
  const { mapLink } = location;

  return mapLink ? (
    <a
      href={mapLink}
      target="_blank"
      className={cn("flex items-center gap-2 text-secondary", className)}
    >
      <LocationDisplay
        location={location}
        icon={<MapPin className="size-4" />}
      />{" "}
    </a>
  ) : (
    <LocationDisplay location={location} />
  );
};

const LocationDisplay = ({
  location,
  icon,
}: {
  location: VenueLocation;
  icon?: ReactNode;
}) => {
  const locale = useLocale();
  const { content: locationContent } = getLocalizedContent(
    location.localizedContent,
    locale,
  );
  const { isDefault, country, city, region } = location;

  return (
    <div className="flex flex-row items-center gap-2 hover:brightness-125">
      <span>
        {locationContent.title}
        {!isDefault
          ? `${city ? `, ${city}` : ""} ${country ? country : ""}`
          : null}
      </span>
      {icon}
    </div>
  );
};
