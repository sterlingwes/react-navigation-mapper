import {
  isNumericLiteral,
  isStringLiteral,
  SyntaxKind,
  type Node,
} from "typescript";

export const getPrimitiveValue = (
  node: Node
): string | number | boolean | null => {
  if (isStringLiteral(node)) {
    return node.text;
  }

  if (isNumericLiteral(node)) {
    return parseFloat(node.text);
  }

  if (SyntaxKind.TrueKeyword === node.kind) {
    return true;
  }

  if (SyntaxKind.FalseKeyword === node.kind) {
    return false;
  }

  return null;
};
