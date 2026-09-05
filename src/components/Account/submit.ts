import { type Credentials, signIn, signUp } from "@/lib/auth";

export type CredentialsMode = "login" | "signup";

/**
 * What the form should do next. Signing up has an outcome logging in does not —
 * a site can require the address be confirmed, which leaves the visitor with an
 * account but no session — so the three cases are kept apart here rather than
 * being re-derived from the response inside the component.
 */
export type SubmitOutcome =
  /** `message` is null when the API sent none; the form translates one. */
  | { kind: "error"; message: string | null }
  | { kind: "confirm-email" }
  | { kind: "signed-in" };

export const submitCredentials = async (
  mode: CredentialsMode,
  siteKey: string,
  credentials: Credentials,
): Promise<SubmitOutcome> => {
  if (mode === "login") {
    const result = await signIn(siteKey, credentials);

    return result.ok
      ? { kind: "signed-in" }
      : { kind: "error", message: result.error };
  }

  const result = await signUp(siteKey, credentials);

  if (!result.ok) {
    return { kind: "error", message: result.error };
  }

  return result.data.confirmEmail
    ? { kind: "confirm-email" }
    : { kind: "signed-in" };
};

/**
 * Either the API's own words or a key into the `account` dictionary. The API
 * answers in English only, so its message is passed through as-is; everything
 * the template says for itself stays translatable.
 */
export type SubmitMessage =
  | { text: string }
  | { key: "confirm_email" | "request_failed" | "session_failed" };

/** What the form shows once a submit has resolved. */
export type SubmitView =
  | { kind: "close" }
  | { kind: "notice"; message: SubmitMessage }
  | { kind: "error"; message: SubmitMessage };

/**
 * Turns a submit outcome into what the form does, given whether re-reading the
 * session actually found one.
 *
 * `hasSession` is the point of this: a 200 means the API set the cookie, not
 * that the browser kept it. Closing the dialog on a sign-in whose cookie was
 * blocked would drop the visitor back on a nav that still says "Log in" with
 * nothing said about why.
 */
export const resolveSubmit = (
  outcome: SubmitOutcome,
  hasSession: boolean,
): SubmitView => {
  if (outcome.kind === "error") {
    return {
      kind: "error",
      message: outcome.message
        ? { text: outcome.message }
        : { key: "request_failed" },
    };
  }

  // Nothing was signed in, so there is no session to look for.
  if (outcome.kind === "confirm-email") {
    return { kind: "notice", message: { key: "confirm_email" } };
  }

  return hasSession
    ? { kind: "close" }
    : { kind: "error", message: { key: "session_failed" } };
};
