"use server";

/**
 * Submits a mailing-list signup to Venue's public endpoint.
 *
 * Runs on the server so the site's API key never reaches the browser, and so
 * the form still works before (or without) client JavaScript. The API's status
 * codes are folded into a small set of outcomes the form knows how to word;
 * the API's own error strings are English and not meant for readers.
 */

const API_ROOT = "https://app.venuecms.com";

/** The API accepts at most this many tags per signup. */
const MAX_TAGS = 50;

export type SignupStatus =
  | "idle"
  | "success"
  | "invalid"
  | "disabled"
  | "rate_limited"
  | "error";

export type SignupState = {
  status: SignupStatus;
  /** What the reader typed, so a failed attempt does not clear the field. */
  email?: string;
  /** Seconds until a rate-limited reader may try again. */
  retryAfter?: number;
};

export const subscribeToMailingList = async (
  siteKey: string,
  tags: string[],
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> => {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";

  if (!email || !email.includes("@")) {
    return { status: "invalid", email };
  }

  let response: Response;
  try {
    response = await fetch(
      `${API_ROOT}/api/v2/${encodeURIComponent(siteKey)}/public/mailing-list`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VENUE_API_KEY}`,
        },
        body: JSON.stringify({ email, tags: tags.slice(0, MAX_TAGS) }),
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("Mailing list signup failed", error);
    return { status: "error", email };
  }

  switch (response.status) {
    case 200: {
      const body = await response.json().catch(() => null);
      return body?.success ? { status: "success" } : { status: "error", email };
    }
    case 400:
      return { status: "invalid", email };
    case 403:
      return { status: "disabled", email };
    case 429: {
      const body = await response.json().catch(() => null);
      const retryAfter =
        typeof body?.retryAfter === "number"
          ? body.retryAfter
          : Number(response.headers.get("Retry-After")) || undefined;
      return { status: "rate_limited", email, retryAfter };
    }
    default:
      // 404 (site or tag not found) is a configuration problem, not something
      // the reader can fix, so it reads the same as any other failure.
      console.error(
        "Mailing list signup failed",
        response.status,
        await response.text().catch(() => ""),
      );
      return { status: "error", email };
  }
};
