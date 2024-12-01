export const getPublicImage = (image: { url?: string | null }) =>
  image?.url && `/media/${encodeURIComponent(image.url)}`;
