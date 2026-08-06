import {
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { resolvePageHref } from "./href";

export const PagesList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-6 text-sm", className)}>{children}</div>
);

/**
 * A page or news article as a dated title link. News and page listings share
 * this: both endpoints return the same record shape, and only the route and
 * whether a date is worth showing differ.
 */
export const ListPage = ({
  page,
  withDate,
  className,
}: {
  page: VenuePage;
  withDate?: boolean;
  className?: string;
}) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(page.localizedContent, locale);
  const { href, isExternal } = resolvePageHref(page);

  const date =
    withDate && typeof page.date === "string"
      ? format(new Date(page.date), "d MMMM yyyy")
      : null;

  return (
    <div className={cn("flex flex-col", className)}>
      {date ? <div className="text-secondary">{date}</div> : null}
      <div className="text-balance text-primary hover:brightness-150">
        <Link href={href} target={isExternal ? "_blank" : "_self"}>
          {content.title}
        </Link>
      </div>
    </div>
  );
};
