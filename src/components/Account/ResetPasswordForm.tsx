"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState, useTransition } from "react";

import { requestPasswordReset } from "@/lib/auth";

import { Input } from "../ui/Input";

/**
 * Asks VenueCMS to email a reset link. Choosing a new password happens on the
 * VenueCMS-hosted screen that link opens, which then returns the visitor here —
 * so this form's whole job is collecting the address and reporting what
 * happened.
 */
export const ResetPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const t = useTranslations("account");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      // The reset link has to carry somewhere to come back to. Reading it here
      // rather than on mount keeps this out of the server render, where there
      // is no location to read.
      const accepted = await requestPasswordReset({
        email,
        origin: window.location.origin,
      });

      setMessage(
        accepted
          ? { text: t("check_email"), isError: false }
          : { text: t("reset_failed"), isError: true },
      );
    });
  };

  const isSent = message !== null && !message.isError;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {message ? (
        <p
          className={message.isError ? "text-sm text-red-600" : "text-sm"}
          role={message.isError ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}

      {isSent ? null : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm" htmlFor="account-reset-email">
              {t("email")}
            </label>
            <Input
              id="account-reset-email"
              className="h-10 px-3"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="ml-auto border border-primary px-4 py-2 text-sm disabled:opacity-50"
            disabled={isPending}
          >
            {t("reset_password")}
          </button>
        </>
      )}

      <button
        type="button"
        className="mr-auto text-sm underline"
        onClick={onBack}
      >
        {t("back_to_login")}
      </button>
    </form>
  );
};
