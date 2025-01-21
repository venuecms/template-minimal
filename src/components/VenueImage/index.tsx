import { MediaItem } from "@venuecms/sdk";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { getPublicImage } from "../utils";
import ResponsiveImage from "./ResponsiveImage";

const ASPECTS = {
  square: "aspect-square",
  video: "aspect-video",
};

export const VenueImage = ({
  className,
  image,
  aspect,
  props,
}: {
  className?: string;
  image?: Partial<MediaItem>;
  aspect?: keyof typeof ASPECTS;
  props?: object;
}) => {
  if (image) {
    const imageUrl = getPublicImage(image);

    if (imageUrl) {
      const { metadata } = image;
      const { width, height, altText } = metadata ?? {};

      return aspect ? (
        <ImageWrapper aspect={aspect}>
          <ResponsiveImage src={imageUrl} className={className} />
        </ImageWrapper>
      ) : (
        <Image
          src={imageUrl}
          alt={(altText as string) ?? "image"}
          width={(width as number) ?? 2048}
          height={(height as number) ?? 2048}
          className={className}
          {...props}
        />
      );
    }
  }

  if (aspect) {
    return (
      <ImageWrapper aspect={aspect}>
        <ResponsiveImage src="" className={className} />
      </ImageWrapper>
    );
  }

  return null; // TODO: return a placeholder
};

// wrapper to contain the ResponsiveImage
const ImageWrapper = ({
  children,
  aspect,
}: {
  children?: React.ReactNode;
  aspect: keyof typeof ASPECTS;
}) => (
  <div className="flex h-full w-full flex-col gap-1">
    <div
      className={cn(
        "relative h-full w-full bg-cover bg-center",
        ASPECTS[aspect],
      )}
    >
      {children}
    </div>
  </div>
);
