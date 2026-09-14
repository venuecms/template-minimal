/**
 * The event listing mounted somewhere other than /events.
 *
 * A page whose type is EVENTLIST renders this same listing from /p/<slug>, so
 * the page record it titles itself from comes from a prop. There is no pager to
 * relocate with it — the listing takes the next 60 upcoming events and stops —
 * so the title is the whole of what moves.
 *
 * `connection()` and `getTranslations` are stubbed because both need a Next
 * request scope that a bare render has no way to provide.
 */
import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/lib/i18n/dictionaries/en.json";

import { EventsListContent } from "./EventsListContent";

vi.mock("next/server", () => ({ connection: async () => {} }));

vi.mock("next-intl/server", async () => {
  const dictionary = (await import("@/lib/i18n/dictionaries/en.json")).default;

  return {
    getTranslations:
      async (namespace: keyof typeof dictionary) => (key: string) =>
        (dictionary[namespace] as Record<string, string>)?.[key] ?? key,
  };
});

let requested: Array<string> = [];

beforeEach(() => {
  requested = [];
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    requested.push(url);

    const body = url.includes("/events")
      ? { records: [], count: 0 }
      : url.includes("/pages/")
        ? {
            id: "page-id",
            slug: "programme",
            type: "EVENTLIST",
            localizedContent: [
              { siteId: "site-id", locale: "en", title: "Our Programme" },
            ],
          }
        : { id: "site-id", timeZone: "Europe/Berlin", settings: {} };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const render = async (node: React.ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;

  return new Response(stream).text();
};

describe("the event listing away from /events", () => {
  it("titles itself from the page it was given, not the events page", async () => {
    const html = await render(
      <EventsListContent locale="en" slug="programme" />,
    );

    expect(html).toContain("Our Programme");
    expect(requested.some((url) => url.includes("/pages/programme"))).toBe(
      true,
    );
    expect(requested.some((url) => url.includes("/pages/events"))).toBe(false);
  });
});
