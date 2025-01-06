"use client";

import { Page, getLocalizedContent } from "@venuecms/sdk";
import { ChevronRight } from "lucide-react";
import TreeView, { flattenTree } from "react-accessible-treeview";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PageWithParent, buildTree } from "@/lib/utils/tree";

export function PageTree({ pages }: { pages: Array<PageWithParent> }) {
  const pageTree = buildTree(pages);

  return (
    <div>
      <TreeView
        data={flattenTree({
          name: "",
          id: "pageTree",
          // @ts-ignore
          children: pageTree,
        })}
        aria-label="Pages"
        className="[&_li]:pb-4 [&_li:first-child]:pt-4"
        nodeRenderer={({
          element,
          isBranch,
          isExpanded,
          getNodeProps,
          level,
          handleExpand,
        }) => {
          // @ts-ignore - ignoring as the typing is partially handled in the underlying library
          const { localizedContent, slug } = element.metadata as Page;
          const { content } = getLocalizedContent(localizedContent, "en");

          return (
            <div
              {...getNodeProps({ onClick: handleExpand })}
              style={{
                marginLeft: 40 * (level - 1),
              }}
              className="flex items-start gap-4"
            >
              {isBranch && (
                <ArrowIcon
                  className="size-4 relative top-1"
                  isOpen={isExpanded}
                />
              )}
              <Link href={`/p/${slug}`} className="name">
                {content.title}
              </Link>
            </div>
          );
        }}
      />
    </div>
  );
}

const ArrowIcon = ({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) => {
  return <ChevronRight className={cn(isOpen && "rotate-90", className)} />;
};
