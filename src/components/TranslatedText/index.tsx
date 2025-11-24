"use client";

import { useTranslations } from "next-intl";
import { ReactNode } from "react";

/**
 * Client component wrapper for translations in server components.
 * Allows server components to display translated text without becoming client components.
 */
export function TranslatedText({
  text,
  namespace,
  values,
}: {
  text: string;
  namespace: string;
  /**
   * Optional values for interpolation
   * @example { count: 5 } for "Found {count} events"
   */
  values?: Record<string, string | number | boolean | null | undefined>;
}): ReactNode {
  const t = useTranslations(namespace);

  const translatedText = t(text, values);

  return translatedText;
}
