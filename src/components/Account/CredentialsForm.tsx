"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { Input } from "../ui/Input";
import { useAccount } from "./provider";
import { credentialsMutationOptions } from "./queries";
import { type CredentialsMode, type SubmitMessage } from "./submit";

/**
 * Log in and sign up ask for the same two fields and differ only in which
 * endpoint they post to and what a success means, so they share a form.
 */
export const CredentialsForm = ({
  mode,
  onModeChange,
  onSignedIn,
}: {
  mode: CredentialsMode;
  onModeChange: (mode: "login" | "signup" | "reset") => void;
  /** Closes the dialog once the visitor actually has a session. */
  onSignedIn: () => void;
}) => {
  const t = useTranslations("account");
  const { siteKey } = useAccount();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRevealed, setPasswordRevealed] = useState(false);

  const {
    mutate,
    reset,
    data: view,
    isPending,
  } = useMutation(credentialsMutationOptions(queryClient, siteKey));

  const isSignup = mode === "signup";

  // Both come off the one resolved view, so the form can never be showing a
  // rejection and a notice at once.
  const error: SubmitMessage | null =
    view?.kind === "error" ? view.message : null;
  const notice: SubmitMessage | null =
    view?.kind === "notice" ? view.message : null;

  /** The API answers in English; anything the template says is translated. */
  const read = (message: SubmitMessage) =>
    "text" in message ? message.text : t(message.key);

  // A rejection belongs to the screen that produced it — carrying "Invalid login
  // credentials" over to the sign-up form would read as a rejected signup.
  const changeMode = (next: "login" | "signup" | "reset") => {
    reset();
    onModeChange(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate(
      { mode, credentials: { email, password } },
      {
        onSuccess: (result) => {
          if (result.kind === "close") {
            onSignedIn();
          }
        },
      },
    );
  };

  if (notice) {
    return <p className="py-4 text-sm">{read(notice)}</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {read(error)}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="account-email">
          {t("email")}
        </label>
        <Input
          id="account-email"
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

      <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor="account-password">
          {t("password")}
        </label>
        <div className="relative flex">
          <Input
            id="account-password"
            className="h-10 w-full px-3 pr-10"
            type={passwordRevealed ? "text" : "password"}
            name="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••"
            minLength={isSignup ? 6 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={
              passwordRevealed ? t("hide_password") : t("show_password")
            }
            onClick={() => setPasswordRevealed(!passwordRevealed)}
          >
            {passwordRevealed ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {isSignup ? null : (
          <button
            type="button"
            className="text-sm underline"
            onClick={() => changeMode("reset")}
          >
            {t("forgot_password")}
          </button>
        )}
        <button
          type="submit"
          className="ml-auto border border-primary px-4 py-2 text-sm disabled:opacity-50"
          disabled={isPending}
        >
          {isSignup ? t("create_account") : t("login")}
        </button>
      </div>

      <p className="flex items-center justify-between gap-4 border-t border-muted pt-4 text-sm">
        {isSignup ? t("have_account") : t("no_account")}
        <button
          type="button"
          className="underline"
          onClick={() => changeMode(isSignup ? "login" : "signup")}
        >
          {isSignup ? t("login") : t("signup")}
        </button>
      </p>
    </form>
  );
};
