"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { signOut } from "@/lib/auth";

import { useAccount } from "./provider";

/** What a signed-in visitor sees in the dialog. */
export const AccountMenu = ({ onSignedOut }: { onSignedOut: () => void }) => {
  const t = useTranslations("account");
  const { account, siteKey, refresh } = useAccount();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSignOut = () => {
    setError("");

    startTransition(async () => {
      const result = await signOut(siteKey);

      if (!result.ok) {
        // Closing here would tell the visitor they had signed out while their
        // session cookie is still live.
        setError(t("signout_failed"));
        return;
      }

      // Close first: re-reading `me` swaps this menu for the log-in form, which
      // would blink into view on the way out.
      onSignedOut();

      // The API clears the session cookie on its response; re-reading `me` is
      // what turns that into a signed-out nav.
      await refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {account?.roles.length ? (
        <p className="text-sm text-muted">
          {account.roles.map((role) => role.name).join(", ")}
        </p>
      ) : null}

      <button
        type="button"
        className="border border-primary px-4 py-2 text-sm disabled:opacity-50"
        onClick={handleSignOut}
        disabled={isPending}
      >
        {t("logout")}
      </button>
    </div>
  );
};
