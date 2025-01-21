"use client";

import { Page, getLocalizedContent } from "@venuecms/sdk";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import TreeView, { INode, flattenTree } from "react-accessible-treeview";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  PageWithParent,
  PageWithParentAndChildren,
  buildTree,
} from "@/lib/utils/tree";

type NodeFlatMetadata = INode<IFlatMetadata> & { id: string };

export function PageTree({ pages }: { pages: Array<PageWithParent> }) {
  const { slug } = useParams();
  const pageTree = buildTree(pages);

  const currentPage = pages.find((page) => page.slug === slug);
  // find the top-most node in the tree and remove all others for this nav
  const rootNodeId = currentPage
    ? getRootNodeId(pageTree, currentPage.id)
    : undefined;
  const rootPageTree = pageTree.filter((node) => node.id === rootNodeId);
  const flatPageTree = flattenTree({
    name: "",
    id: "pageTree",
    // @ts-ignore
    children: rootPageTree,
  });

  const ancestorsOfCurrentpage = currentPage
    ? [
      ...getAncestors(
        flatPageTree as Array<NodeFlatMetadata>,
        currentPage.id,
      ),
      currentPage.id,
    ]
    : [];

  return (
    <div>
      <TreeView
        data={flatPageTree}
        aria-label="Pages"
        className="[&_li:first-child]:pt-4 [&_li]:pb-4"
        defaultExpandedIds={ancestorsOfCurrentpage}
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

          if (
            currentPage?.id === element.id &&
            element.children.length === 0 &&
            element.metadata?.parentId === undefined
          ) {
            return null;
          }

          return (
            <div
              {...getNodeProps({ onClick: handleExpand })}
              style={{
                marginLeft: 30 * (level - 1),
              }}
              className="flex items-center gap-2"
            >
              <Link
                href={`/p/${slug}`}
                className={cn(
                  "name",
                  element.metadata?.id === currentPage?.id && "font-bold",
                )}
              >
                {content.title}
              </Link>
              {isBranch && (
                <ArrowIcon
                  className="relative top-[0.15rem] size-4"
                  isOpen={isExpanded}
                />
              )}
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

const getAncestors = (
  nodes: Array<NodeFlatMetadata>,
  targetId: string,
  ancestors: string[] = [],
): string[] => {
  // Find all parent nodes that have the target as a child
  const parents = nodes.filter((node) => node.children.includes(targetId));

  // If no parents found, return current ancestors
  if (parents.length === 0) {
    return ancestors;
  }

  // For each parent, recursively find their ancestors
  return parents.reduce((acc, parent) => {
    // Add current parent to ancestors
    const updatedAncestors = [...acc, parent.id];
    // Find ancestors of the current parent
    return getAncestors(nodes, parent.id, updatedAncestors);
  }, ancestors);
};

const getRootNodeId = (
  nodes: PageWithParentAndChildren[],
  targetId: string,
): string | null => {
  // Helper function to check if a node or its children contain the target ID
  const containsId = (node: any, id: string): boolean => {
    if (node.id === id) {
      return true;
    }

    return node.children.some((child: PageWithParentAndChildren) =>
      containsId(child, id),
    );
  };

  // Search through root nodes
  for (const node of nodes) {
    if (containsId(node, targetId)) {
      return node.id;
    }
  }

  return null;
};
