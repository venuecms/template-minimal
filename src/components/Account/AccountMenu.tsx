"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useAccount } from "./provider";
import { signOutMutationOptions } from "./queries";

/** What a signed-in visitor sees in the dialog. */
export const AccountMenu = ({ onSignedOut }: { onSignedOut: () => void }) => {
  const t = useTranslations("account");
  const { account, siteKey } = useAccount();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation(
    signOutMutationOptions(queryClient, siteKey),
  );

  const handleSignOut = () => {
    // Only on the way out: closing on a refusal would tell the visitor they had
    // signed out while their session cookie is still live. The mutation clears
    // the cached session itself, so the dialog closes on the same tick the nav
    // goes back to saying "Log in" rather than a round-trip later.
    mutate(undefined, { onSuccess: onSignedOut });
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          {t("signout_failed")}
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
