"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useMemo } from "react";

import { cn } from "@/lib/utils";
import { useSiteKey } from "@/lib/utils/VenueProvider";

import { type SignupState, subscribeToMailingList } from "./actions";

const initialState: SignupState = { status: "idle" };

export const EmailSignupForm = ({
  tags = [],
  className,
}: {
  /** Ids of the tags a signup is filed under, from the content node. */
  tags?: string[];
  className?: string;
}) => {
  const t = useTranslations("signup");
  const inputId = useId();
  const messageId = useId();
  const siteKey = useSiteKey();

  // Bound rather than wrapped in a closure, so the form posts to the server
  // action directly and still submits before hydration.
  const action = useMemo(
    () => subscribeToMailingList.bind(null, siteKey ?? "", tags),
    [siteKey, tags],
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  // Outside a VenueProvider there is no site to sign anyone up to.
  if (!siteKey) {
    return null;
  }

  if (state.status === "success") {
    return (
      <p role="status" className={cn("text-sm text-primary", className)}>
        {t("success")}
      </p>
    );
  }

  const isError = state.status !== "idle";
  const message =
    state.status === "rate_limited"
      ? state.retryAfter
        ? t("rate_limited_seconds", { seconds: Math.ceil(state.retryAfter) })
        : t("rate_limited")
      : isError
        ? t(state.status)
        : null;

  return (
    <form
      action={formAction}
      className={cn("flex max-w-[72ch] flex-col gap-2", className)}
    >
      <label htmlFor={inputId} className="text-sm text-secondary">
        {t("label")}
      </label>
      <div className="flex flex-row gap-4">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder={t("placeholder")}
          aria-invalid={state.status === "invalid" || undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "min-w-0 flex-1 border border-muted bg-transparent px-2 py-1 text-sm text-primary outline-transparent",
            "placeholder:text-muted focus-within:outline-nav focus-within:ring-transparent",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="border border-primary px-4 py-1 text-sm text-primary hover:bg-primary hover:text-background disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </div>
      <p
        id={messageId}
        role="alert"
        className={cn("text-sm text-error", !message && "sr-only")}
      >
        {message}
      </p>
    </form>
  );
};
