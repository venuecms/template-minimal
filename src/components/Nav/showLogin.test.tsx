/**
 * The login gate.
 *
 * A site opts into accounts with the `showLogin` custom field, so the account
 * control has to be absent — not merely hidden — on every site that has not.
 * Both navs are covered because they are separate trees that each have to
 * honour the flag, and the desktop one additionally has to yield to an open
 * search field, which shares its row.
 *
 * The provider is mocked rather than mounted so these render without a query
 * client or a `me` round-trip; what the trigger reads off it (a name once there
 * is a session, the log-in label before) is the part being pinned.
 */
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/lib/auth";

import messages from "../../lib/i18n/dictionaries/en.json";
import { NavMenuDesktop } from "./NavMenuDesktop";
import { NavMenuMobile } from "./NavMenuMobile";

const { state } = vi.hoisted(() => ({
  state: {
    account: null as Account | null,
    isLoading: false,
    isSearchActive: false,
  },
}));

vi.mock("../Search/provider", () => ({
  useSearchQuery: () => ({
    isActive: state.isSearchActive,
    query: "",
    setQuery: () => {},
    setActive: () => {},
    reset: () => {},
  }),
}));

vi.mock("../Account/provider", () => ({
  AccountProvider: ({ children }: { children: ReactNode }) => children,
  useAccount: () => ({
    account: state.account,
    isLoading: state.isLoading,
    refresh: async () => {},
    siteKey: "sample",
  }),
}));

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const menuItems = (
  <li>
    <a href="/about">About</a>
  </li>
);

beforeEach(() => {
  state.account = null;
  state.isLoading = false;
  state.isSearchActive = false;
});

/** The trigger's icon — present whichever label the session state calls for. */
const ACCOUNT_ICON = "lucide-user";

describe("NavMenuDesktop", () => {
  it("offers the account control when the site enables login", async () => {
    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).toContain(ACCOUNT_ICON);
    expect(html).toContain(messages.account.login);
  });

  it("leaves it out entirely when the site does not", async () => {
    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={false}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).not.toContain(ACCOUNT_ICON);
    expect(html).not.toContain(messages.account.login);
    // The rest of the nav is untouched by the flag.
    expect(html).toContain("/about");
  });

  it("shows the signed-in visitor's name instead of the log-in label", async () => {
    state.account = { name: "Ada Lovelace", roles: [{ name: "member" }] };

    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).toContain("Ada Lovelace");
    expect(html).not.toContain(messages.account.login);
  });

  it("falls back to a generic label for an account with no name", async () => {
    // Signing up through the site sets no name, and an empty label would leave
    // an unreadable button next to the icon.
    state.account = { name: "", roles: [] };

    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).toContain(messages.account.account);
    expect(html).not.toContain(messages.account.login);
  });

  it("stays generically labelled until the session is known", async () => {
    // Rendering "Log in" and then swapping it for a name would flash the wrong
    // state at a visitor who is in fact signed in — but the button still needs
    // an accessible name in the meantime.
    state.isLoading = true;

    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).toContain(ACCOUNT_ICON);
    expect(html).not.toContain(messages.account.login);
    expect(html).toContain(messages.account.account);
  });

  it("names the trigger by its visible label rather than overriding it", async () => {
    // An aria-label here would announce something other than what is on screen.
    const html = await render(
      <NavMenuDesktop showSearch={false} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).not.toContain(`aria-label="${messages.account.account}"`);
    expect(html).toContain(`aria-hidden="true"`);
  });

  it("steps aside while the search field is expanded", async () => {
    // Search takes over the whole row, so the account control would collide.
    state.isSearchActive = true;

    const html = await render(
      <NavMenuDesktop showSearch={true} showLogin={true}>
        {menuItems}
      </NavMenuDesktop>,
    );

    expect(html).not.toContain(ACCOUNT_ICON);
  });
});

describe("NavMenuMobile", () => {
  it("offers the account control when the site enables login", async () => {
    const html = await render(
      <NavMenuMobile logo={null} showLogin={true}>
        {menuItems}
      </NavMenuMobile>,
    );

    expect(html).toContain(ACCOUNT_ICON);
  });

  it("leaves it out entirely when the site does not", async () => {
    const html = await render(
      <NavMenuMobile logo={null} showLogin={false}>
        {menuItems}
      </NavMenuMobile>,
    );

    expect(html).not.toContain(ACCOUNT_ICON);
    // The menu itself is untouched by the flag.
    expect(html).toContain("lucide-menu");
  });
});
