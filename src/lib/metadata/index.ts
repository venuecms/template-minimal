import { getPublicImage } from "@/components/utils";
import { getLocalizedContent } from "@venuecms/sdk";

export const getLocalizedMetadata = (
  {
    locale,
    item,
    overrides,
  }: {
    locale: string;
    item?: { localizedContent: Array<any> };
    overrides?: Partial<{}>;
  } = { locale: "sv" },
) => {
  const { content } = getLocalizedContent(item?.localizedContent, locale) || {};

  const {
    title = "Fylkingen",
    content:
      description = "Fylkingen is an artist-run, non-profit association for experimental music and art. It was founded in 1933, making it one of the world's oldest forums of its kind.",
    shortContent,
    metaTitle,
    metaDescription,
    keywords,
  } = content;

  const getOpenGraphFromLocalizedContent = (item) => {
    const imageUrl = item?.image && getPublicImage(item.image);

    const trimDescription = description.split("\n")[0];
    return {
      title: metaTitle || title,
      description: metaDescription || shortContent || trimDescription,
      siteName: "Fylkingen",
      ...(imageUrl
        ? {
            images: [
              {
                width: item.image.width,
                height: item.image.height,
                url: imageUrl,
              },
            ],
          }
        : {
            images: [
              {
                width: 1481,
                height: 1111,
                url: "/_next/image?url=%2Fmedia%2Fmedia%252F6a7be8d2-7c33-43b3-b407-0d84d82acdef-Fylkingen_SKYLT.JPG&w=3840&q=75",
              },
            ],
          }),
      locale,
      type: "website",
      ...overrides,
    };
  };

  return {
    title,
    description,
    keywords: keywords?.split(", "),
    openGraph: getOpenGraphFromLocalizedContent(item),
    ...overrides,
  };
};

export const getGenerateMetadata =
  (getItem: (slug: string, ...params: any) => Promise<any>) =>
  async ({ params }: { params: { slug: string; locale: string } }) => {
    const { slug, locale } = params;
    try {
      const item = await getItem(slug);

      const metadata = getLocalizedMetadata({ locale, item });

      return metadata;
    } catch (e) {
      return {};
    }
  };
