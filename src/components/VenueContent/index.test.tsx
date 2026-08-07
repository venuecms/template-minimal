import { type LocalizedContent } from "@venuecms/sdk-next";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The one map a caller passes carries both kinds of entry: a string styles the
 * default renderer for that node type, a function renders a listing block off
 * the records fetched for it. These pin that both reach the SDK correctly,
 * since it takes them as two separate props — and that a listing entry never
 * has to say anything about fetching.
 */
const getEvents = vi.fn();
const getSite = vi.fn();

vi.mock("next/server", () => ({ connection: () => Promise.resolve() }));

vi.mock("@venuecms/sdk-next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@venuecms/sdk-next")>()),
  getEvents,
  getSite,
}));

const { VenueContent } = await import("./index");

const contentWith = (...nodes: Array<Record<string, unknown>>) =>
  ({
    siteId: "site-id",
    locale: "en",
    contentJSON: { type: "doc", content: nodes },
  }) as LocalizedContent;

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const renderStream = async (element: React.ReactElement) => {
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return new Response(stream).text();
};

beforeEach(() => {
  vi.clearAllMocks();
  getSite.mockResolvedValue({ data: { timeZone: "Europe/Berlin" } });
  getEvents.mockResolvedValue({ data: { records: [] } });
});

describe("VenueContent", () => {
  it("applies a string entry as a class name, as it did before", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith(paragraph("Prose"))}
        contentStyles={{ p: "text-primary text-sm" }}
      />,
    );

    expect(html).toContain('class="text-primary text-sm"');
    expect(html).toContain("Prose");
  });

  it("renders a listing entry off the records fetched for the block", async () => {
    getEvents.mockResolvedValue({
      data: { records: [{ id: "first" }, { id: "second" }] },
    });

    const html = await renderStream(
      <VenueContent
        content={contentWith({ type: "eventListing" })}
        contentStyles={{
          eventListing: ({ records }) => (
            <p>{records.map((event) => event.id).join(",")}</p>
          ),
        }}
      />,
    );

    expect(html).toContain("first,second");
  });

  it("queries the endpoint with the filters the block carries", async () => {
    await renderStream(
      <VenueContent
        content={contentWith({
          type: "eventListing",
          attrs: { limit: "3", tags: "jazz" },
        })}
        contentStyles={{ eventListing: () => null }}
      />,
    );

    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 3, tags: ["jazz"] }),
    );
  });

  it("keeps string entries working alongside a listing entry", async () => {
    const html = await renderStream(
      <VenueContent
        content={contentWith(paragraph("Prose"), { type: "eventListing" })}
        contentStyles={{
          p: "text-sm",
          eventListing: () => <div data-listing />,
        }}
      />,
    );

    expect(html).toContain('class="text-sm"');
    expect(html).toContain("data-listing");
  });

  it("renders content when given no map at all", () => {
    const html = renderToStaticMarkup(
      <VenueContent content={contentWith(paragraph("Prose"))} />,
    );

    expect(html).toContain("Prose");
  });
});
