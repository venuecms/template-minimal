import Image, { ImageProps, StaticImageData } from "next/image";

const defaultBlur =
  "data:image/webp;base64,UklGRv4DAABXRUJQVlA4WAoAAAAgAAAAgwEAkwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggEAIAANAdAJ0BKoQBlAA+tVilTqktq6Ij9mohsBaJaW7gAPxl327WrOr58lOBv3B2bV5tXZG3Cs6EfYIdF424VnQj3sc4AMwGX1tsW6mMzpnfFGE1GqNdd/F7s678DobD7FfMxZq6bbtOzeddTkEpR+67ecBjZeqt6WbksaOXRpgBgEOOz4uFCd7CmYlDgXL/btUenqYAvWU/dHQyD2WRrg4L8jdr+i+96BUwSEAuxzz/yZyIpjDAU3sa721c0j+AMO4HenRSOGLzlakWd611T6K5KqXs8Am4keQ1qQED9127pMUPWP9qY5XXO1FJSju/YBoKBjsg3KYTOZAA/vUMRConj2py6XdVy2rj5AFT3UUJuYDcedD9qv+/wNrkmRL5Q+Q/p3tAMxss1zgMyXdiAuRB3G81Lg7asSIQDcl2oLiGi/r9KhPwmr3o19NXEMyqHKAFFkajHBu1F7wU9laytcLsMPFdOTmAjafCJvui62qPOt3Uq0lfNJSWaGE20X7xAR/eg4w/RSRrRSqyst9YYCZexkg5Vu30Rxz3KySFBqy+xh9KAqRuzi1iU1DEeNRWTaXMfqO4JJnl+1ljW0Gynj147omoWIfGrzVBoiEMIAft8agFKSUudUje3Gsc4cSHkqqKLhR1ZGJgAeKbNPVn3RIvYRgVcCyiJLbwIwf9aK6q7hN2psdlEPjMdq4oNmLAqSwAAA==";

export const ResponsiveImage = async ({
  src,
  fallback,
  metadata,
  ...props
}: {
  src: string;
  fallback?: StaticImageData;
  metadata?: any;
} & Partial<ImageProps>) => {
  const remoteImageProps = src
    ? {
        img: {
          src,
        },
        base64: defaultBlur,
      }
    : {
        img: { src: fallback?.src || defaultBlur },
        base64: defaultBlur,
      };

  // Handle image focusing
  const center = { x: 0.5, y: 0.5 };
  if (metadata?.focus) {
    const y = (-metadata.focus.y + 1) / 2;
    if (y > 0.5) {
      const yWithOffest = y;
      center.y = yWithOffest > 1 ? 1 : yWithOffest;
    } else {
      const yWithOffest = y;
      center.y = yWithOffest < 0 ? 0 : yWithOffest;
    }

    const x = (-metadata.focus.x + 1) / 2;
    if (x > 0.5) {
      const xWithOffest = x;
      center.x = xWithOffest > 1 ? 1 : xWithOffest;
    } else {
      const xWithOffest = x;
      center.x = xWithOffest < 0 ? 0 : xWithOffest;
    }
  }

  return (
    <Image
      alt={""}
      src={remoteImageProps.img.src}
      fill={true}
      placeholder="blur"
      blurDataURL={remoteImageProps.base64}
      objectFit="cover"
      objectPosition={`${center.x * 100}% ${center.y * 100}%`}
      {...props}
    />
  );
};

export default ResponsiveImage;
