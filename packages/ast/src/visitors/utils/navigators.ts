import ts from "typescript";
import { nearestParentOfType } from "./traversal";

// TODO: handle 'all as' import style
export const resolveNavigationStackImportFactoryName = (
  node: ts.ImportSpecifier,
  stackFactories: Record<string, string>
) => {
  const nearestImportDeclaration = nearestParentOfType(
    node,
    ts.SyntaxKind.ImportDeclaration
  );
  const importDeclaration = nearestImportDeclaration
    ? (nearestImportDeclaration as ts.ImportDeclaration)
    : undefined;

  if (!importDeclaration) {
    return;
  }

  const importName = (importDeclaration.moduleSpecifier as ts.StringLiteral)
    .text;
  const factoryName = stackFactories[importName as keyof typeof stackFactories];
  if ((node.name.escapedText as string) === factoryName) {
    return factoryName;
  }
};

export const resolveNavigatorNamespaceFromFactoryCall = (
  node: ts.CallExpression,
  factoryName: string
) => {
  // var Namespace = factoryName();
  if (
    factoryName &&
    node.expression &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name) &&
    ts.isIdentifier(node.expression)
  ) {
    const expression = node.expression;
    if (expression.escapedText === factoryName) {
      return node.parent.name.escapedText as string;
    }
  }
};
