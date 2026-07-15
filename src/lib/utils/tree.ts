import { Page } from "@venuecms/sdk";

export type PageWithParent = Page & { parentId?: string };
export type PageWithParentAndChildren = PageWithParent & {
  children: PageWithParentAndChildren[];
};

export const buildTree = (
  nodes: Array<PageWithParent>,
  parentId?: string,
): Array<PageWithParentAndChildren> => {
  return nodes
    .filter((node) => node.parentId === parentId)
    .map((parent) => ({
      ...parent,
      children: buildTree(nodes, parent.id),
      metadata: parent,
    }));
};
