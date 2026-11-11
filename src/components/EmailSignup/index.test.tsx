/**
 * The `emailListSignup` content node, from the editor's JSON to the API call.
 *
 * Rendering goes through the real SDK renderer with this template's handler
 * map, because the bug this guards against was the renderer dropping the node
 * for want of a handler — a test that renders the form directly would pass
 * either way. The action is exercised on its own with only `fetch` stubbed.
 */
import { type LocalizedContent, VenueContent } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import messages from "@/lib/i18n/dictionaries/en.json";
import { VenueProvider } from "@/lib/utils/VenueProvider";

import { contentComponents, contentHandlers } from "../ListingBlock";
import { subscribeToMailingList } from "./actions";

vi.mock("next/server", () => ({ connection: async () => {} }));

afterEach(() => {
  vi.restoreAllMocks();
});

const signupContent = {
  siteId: "site-id",
  locale: "en",
  title: "Om oss",
  contentJSON: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Before the form" }],
      },
      { type: "emailListSignup", attrs: { tags: ["tag-1"] } },
    ],
  },
} as unknown as LocalizedContent;

const render = async (node: React.ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={messages}>
      <VenueProvider siteKey="test-site">{node}</VenueProvider>
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("emailListSignup in content", () => {
  it("renders a signup form where the author placed it", async () => {
    const html = await render(
      <VenueContent
        content={signupContent}
        contentStyles={contentComponents}
        components={contentHandlers}
      />,
    );

    expect(html).toContain("Before the form");
    expect(html).toContain('type="email"');
    expect(html).toContain(messages.signup.submit);
  });

  it("renders nothing without a site to sign up to", async () => {
    const stream = await renderToReadableStream(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VenueContent
          content={signupContent}
          contentStyles={contentComponents}
          components={contentHandlers}
        />
      </NextIntlClientProvider>,
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain("Before the form");
    expect(html).not.toContain('type="email"');
  });
});

const respond = (status: number, body: unknown) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

const submit = (email: string, tags: string[] = ["tag-1"]) => {
  const formData = new FormData();
  formData.set("email", email);
  return subscribeToMailingList(
    "test-site",
    tags,
    { status: "idle" },
    formData,
  );
};

describe("subscribeToMailingList", () => {
  it("posts the email and the node's tags to the site's endpoint", async () => {
    const fetchSpy = respond(200, { success: true });

    await expect(submit(" reader@example.com ")).resolves.toEqual({
      status: "success",
    });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe(
      "https://app.venuecms.com/api/v2/test-site/public/mailing-list",
    );
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "reader@example.com",
      tags: ["tag-1"],
    });
  });

  it("rejects an obviously invalid email without calling the API", async () => {
    const fetchSpy = respond(200, { success: true });

    await expect(submit("not-an-email")).resolves.toMatchObject({
      status: "invalid",
      email: "not-an-email",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    [400, { error: "bad" }, { status: "invalid" }],
    [403, { error: "off" }, { status: "disabled" }],
    [404, { error: "missing" }, { status: "error" }],
    [
      429,
      { error: "slow", retryAfter: 30 },
      { status: "rate_limited", retryAfter: 30 },
    ],
    [500, { error: "boom" }, { status: "error" }],
  ])(
    "maps a %i response to a reader-facing outcome",
    async (code, body, expected) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      respond(code, body);

      await expect(submit("reader@example.com")).resolves.toMatchObject({
        ...expected,
        email: "reader@example.com",
      });
    },
  );

  it("treats a network failure as a retryable error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("offline"));

    await expect(submit("reader@example.com")).resolves.toMatchObject({
      status: "error",
    });
  });
});
