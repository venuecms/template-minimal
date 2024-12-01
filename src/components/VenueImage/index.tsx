import { getPublicImage } from "../utils";
import Image from "next/image";

export const VenueImage = ({
  className,
  image,
}: {
  className?: string;
  image: any;
}) => {
  if (image) {
    const imageUrl = getPublicImage(image);

    if (imageUrl) {
      const { metadata } = image;
      const { width, height, altText } = metadata ?? {};

      return (
        <Image
          src={imageUrl}
          alt={altText as string}
          width={(width as number) ?? 2048}
          height={(height as number) ?? 2048}
          className={className}
        />
      );
    }
  }

  return null; // TODO: return a placeholder
};
