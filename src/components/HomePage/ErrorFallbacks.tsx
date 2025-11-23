import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

export function FeaturedEventsError() {
  return null; // Featured events are optional, so hide on error
}

export function EventsError() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex" />
      <ColumnRight>
        <p className="text-secondary">
          Unable to load events. Please try refreshing the page.
        </p>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function ProductsError() {
  return null; // Products are optional and site-specific, so hide on error
}
