"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useState, useTransition } from "react";

import { Input } from "../ui/Input";
import { useAccount } from "./provider";
import {
  type CredentialsMode,
  type SubmitMessage,
  resolveSubmit,
  submitCredentials,
} from "./submit";

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
  const { siteKey, refresh } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [error, setError] = useState<SubmitMessage | null>(null);
  const [notice, setNotice] = useState<SubmitMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSignup = mode === "signup";

  /** The API answers in English; anything the template says is translated. */
  const read = (message: SubmitMessage) =>
    "text" in message ? message.text : t(message.key);

  // A rejection belongs to the screen that produced it — carrying "Invalid login
  // credentials" over to the sign-up form would read as a rejected signup.
  const changeMode = (next: "login" | "signup" | "reset") => {
    setError(null);
    setNotice(null);
    onModeChange(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const outcome = await submitCredentials(mode, siteKey, {
        email,
        password,
      });

      // Only a signed-in outcome has a session to go looking for.
      const hasSession =
        outcome.kind === "signed-in" ? !!(await refresh()) : false;
      const view = resolveSubmit(outcome, hasSession);

      if (view.kind === "close") {
        onSignedIn();
      } else if (view.kind === "notice") {
        setNotice(view.message);
      } else {
        setError(view.message);
      }
    });
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
