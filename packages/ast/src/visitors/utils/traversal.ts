import type ts from "typescript";

export const nearestParentOfType = (
  node: ts.Node,
  kind: ts.SyntaxKind,
  maxDepth = 5
) => {
  let parent = node.parent;
  let depth = 0;
  while (parent && parent.kind !== kind && depth < maxDepth) {
    parent = parent.parent;
    depth++;
  }
  return parent.kind === kind ? parent : undefined;
};
