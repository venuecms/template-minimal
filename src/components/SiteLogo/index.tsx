import { cn } from "@/lib/utils";
import { Site } from "@venuecms/sdk";
import { getPublicImage } from "../utils";
import Image from "next/image";
import { Link } from "@/lib/i18n";

export const SiteLogo = ({
  className,
  site,
}: {
  className?: string;
  site: Site;
}) => {
  const { name, image } = site;

  if (image) {
    const imageUrl = getPublicImage(image);

    if (imageUrl) {
      const { metadata } = image;
      const { width, height, altText } = metadata ?? {};
      return (
        <Link href="/">
          <Image
            src={imageUrl}
            alt={altText ?? name}
            width={width as number}
            height={height as number}
            className="w-[32rem]"
          />
        </Link>
      );
    }
  }

  return (
    <h1 className={cn("text-xl", className)}>
      <Link href="/">{name}</Link>
    </h1>
  );
};
