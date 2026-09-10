import { useTranslations } from "next-intl";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export function FeaturedEventsError() {
  return null; // Featured events are optional, so hide on error
}

export function EventsError() {
  const t = useTranslations("events");

  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex" />
      <ColumnRight>
        <p className="text-secondary">{t("load_error")}</p>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function ProductsError() {
  return null; // Products are optional and site-specific, so hide on error
}
