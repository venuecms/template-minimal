import { MediaItem, VenueImage as SdkVenueImage } from "@venuecms/sdk-next";

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
}) => (
  <CreditWrapper credit={image?.credit}>
    <SdkVenueImage
      className={className}
      image={image}
      aspect={aspect}
      props={props}
    />
  </CreditWrapper>
);

const CreditWrapper = ({
  children,
  credit,
}: {
  children?: React.ReactNode;
  credit?: string | null;
}) =>
  credit ? (
    <div className="relative">
      {children}
      <div className="absolute bottom--1 right-0 text-end text-xs text-muted opacity-60">
        {credit}
      </div>
    </div>
  ) : (
    children
  );
