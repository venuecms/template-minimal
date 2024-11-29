import { type Page as VenuePage, getLocalizedContent } from "@venuecms/sdk";
import { useLocale } from "next-intl";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

export const Page = ({ page }: { page: VenuePage }) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(page?.localizedContent, locale);

  return (
    <TwoColumnLayout>
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>
            <div>{content.title}</div>
          </div>
        </div>
      </ColumnLeft>

      <ColumnRight>
        <p className="max-w-[42rem] text-sm">{content.content}</p>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
