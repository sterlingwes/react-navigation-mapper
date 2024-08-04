import ts, {
  isIdentifier,
  isImportDeclaration,
  isVariableDeclaration,
} from "typescript";
import { nearestParentOfType } from "./traversal";

export const importSpecifierIsNativeStackScreenPropsType = (
  node: ts.ImportSpecifier
) => {
  if (node.name.escapedText !== "NativeStackScreenProps") {
    return false;
  }

  const importDeclarationNode = nearestParentOfType(
    node,
    ts.SyntaxKind.ImportDeclaration
  );
  return (
    importDeclarationNode &&
    isImportDeclaration(importDeclarationNode) &&
    (importDeclarationNode.moduleSpecifier as ts.StringLiteral).text ===
      "@react-navigation/native-stack"
  );
};

export const typeReferenceIsNavigationScreenProp = (
  node: ts.TypeReferenceNode
) => {
  return (
    node.typeName.kind === ts.SyntaxKind.Identifier &&
    (node.typeName as ts.Identifier).escapedText === "NativeStackScreenProps" &&
    node.parent.kind === ts.SyntaxKind.Parameter &&
    (node.parent as ts.ParameterDeclaration).name.kind ===
      ts.SyntaxKind.ObjectBindingPattern
  );
};

export const propertyAccessIsOnNavigation = (
  node: ts.PropertyAccessExpression,
  navigationPropName: string
) => {
  return (
    node.expression.kind === ts.SyntaxKind.Identifier &&
    (node.expression as ts.Identifier).escapedText === navigationPropName &&
    node.parent.kind === ts.SyntaxKind.CallExpression
  );
};

export const getNavigationHookReturn = (
  node: ts.CallExpression,
  hookName: string
) => {
  if (
    isIdentifier(node.expression) &&
    node.expression.escapedText === hookName &&
    node.parent &&
    isVariableDeclaration(node.parent) &&
    node.parent.name &&
    isIdentifier(node.parent.name)
  ) {
    return node.parent.name.escapedText as string;
  }
};

export const getNavigationMethodName = (node: ts.PropertyAccessExpression) => {
  return node.name.escapedText as string;
};

export const isValidNavigationMethod = (
  methodName: string
): methodName is "push" | "replace" | "navigate" => {
  return ["push", "replace", "navigate"].includes(methodName);
};

export const getNavigationDestination = (node: ts.PropertyAccessExpression) => {
  const firstArg = (node.parent as ts.CallExpression).arguments[0];
  if (firstArg.kind === ts.SyntaxKind.StringLiteral) {
    return (firstArg as ts.StringLiteral).text;
  }
  // TODO: handle object form or imported string reference
  return "UNHANDLED";
};
