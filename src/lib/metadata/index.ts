import { Params } from "@/types";
import {
  type LocalizedContent,
  MediaItem,
  type Site,
  getLocalizedContent,
  getSite,
} from "@venuecms/sdk";
import removeMarkdown from "remove-markdown";

import { getPublicImage, setupSSR } from "@/components/utils";

type LocalizedItem = {
  image?: MediaItem;
  localizedContent: Array<LocalizedContent>;
};

type Metadata = {
  title: string;
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;

  content: string;
  shortContent: string;
};

export const getLocalizedMetadata = ({
  locale,
  item,
  site,
  overrides = {},
}: {
  locale: string;
  item?: LocalizedItem;
  site: Site;
  overrides?: Partial<Metadata>;
}) => {
  const { content } = item?.localizedContent
    ? getLocalizedContent(item?.localizedContent, locale)
    : {};

  const {
    title,
    content: description,
    shortContent,
    metaTitle,
    metaDescription,
    keywords,
  } = content ?? overrides;

  const getOpenGraphFromLocalizedContent = (item?: LocalizedItem) => {
    const imageUrl = item?.image && getPublicImage(item.image);
    const siteImageUrl = site.image && getPublicImage(site.image);

    const trimDescription = description
      ? removeMarkdown(description).split("\n")[0]
      : undefined;
    return {
      title: metaTitle || title,
      description: metaDescription || shortContent || trimDescription,
      siteName: site.name,
      ...(item?.image && imageUrl
        ? {
            images: [
              {
                width: item.image.metadata?.width,
                height: item.image.metadata?.height,
                url: imageUrl,
              },
            ],
          }
        : {
            images: [
              {
                width: site.image?.metadata?.width,
                height: site.image?.metadata?.height,
                url: siteImageUrl,
              },
            ],
          }),
      locale,
      type: "website",
      ...overrides,
    };
  };

  return {
    title: `${site.name}${title ? ` - ${title}` : ""}`,
    description:
      metaDescription ||
      shortContent ||
      (description ? removeMarkdown(description) : undefined),
    keywords: keywords?.split(", "),
    openGraph: getOpenGraphFromLocalizedContent(item),
    ...overrides,
  };
};

// Gets metadata for a single item that is queried by a slug.
// When a getItem is not passed, it will simply use the overrides passed
export const getGenerateMetadata =
  (getItem: (params: { slug: string }) => Promise<{ data: any }>) =>
  async ({ params }: { params: Promise<Params & { slug: string }> }) => {
    try {
      const { slug, locale } = await params;
      await setupSSR({ params });

      const [{ data: site }, { data: item }] = await Promise.all([
        getSite(),
        getItem({ slug }),
      ]);

      if (!site || !item) {
        return {};
      }

      const metadata = getLocalizedMetadata({
        locale,
        item,
        site,
      });

      return metadata;
    } catch (e) {
      return {};
    }
  };
