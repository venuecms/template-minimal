export const getPublicImage = (image: { url?: string }) =>
  image && image?.url && `/media/${encodeURIComponent(image.url)}`;
