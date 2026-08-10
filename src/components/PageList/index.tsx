import {
  type Site,
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";
import { ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { formatDate } from "../utils/date";

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
 * this: both endpoints return the same record shape.
 *
 * The caller supplies the link, because the two listings route the same record
 * differently — a news article belongs to /news/<slug>, while the identical
 * record reached as a page belongs to /p/<slug>.
 */
export const ListPage = ({
  page,
  site,
  href,
  target = "_self",
  withDate,
  className,
}: {
  page: VenuePage;
  site: Site;
  href: string;
  target?: "_blank" | "_self";
  withDate?: boolean;
  className?: string;
}) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(page.localizedContent, locale);

  const date =
    withDate && typeof page.date === "string"
      ? formatDate({
          date: page.date,
          withTime: false,
          timeZone: site.timeZone ?? undefined,
          template: "d MMMM yyyy",
        })
      : null;

  return (
    <div className={cn("flex flex-col", className)}>
      {date ? <div className="text-secondary">{date}</div> : null}
      <div className="text-balance text-primary hover:brightness-150">
        <Link href={href} target={target}>
          {content.title}
        </Link>
      </div>
    </div>
  );
};
