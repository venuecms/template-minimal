export const getPublicImage = (image: { url?: string }) =>
  image?.url && `/media/${encodeURIComponent(image.url)}`;
