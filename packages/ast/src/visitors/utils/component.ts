import ts, {
  isArrowFunction,
  isFunctionDeclaration,
  isVariableDeclaration,
} from "typescript";

export const varDeclarationIsPossibleFunctionComponent = (
  node: ts.VariableDeclaration
) => {
  return (
    node.initializer?.kind === ts.SyntaxKind.ArrowFunction ||
    node.initializer?.kind === ts.SyntaxKind.FunctionExpression
  );
};

export const functionDeclarationIsPossibleComponent = (
  node: ts.FunctionDeclaration
) => {
  return (
    node.name &&
    ts.isIdentifier(node.name) &&
    /^[A-Z]/.test(node.name.escapedText as string) &&
    !!node.modifiers &&
    !!node.modifiers.find((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
  );
};

export const getVarDeclarationName = (node: ts.VariableDeclaration) => {
  return (node.name as ts.Identifier).escapedText as string;
};

export const getFunctionDeclarationName = (node: ts.FunctionDeclaration) => {
  const name =
    node.name &&
    ts.isIdentifier(node.name) &&
    (node.name.escapedText as string);

  if (typeof name === "string") {
    return name;
  }
};

export const getBlockPosition = (
  node: ts.VariableDeclaration | ts.FunctionDeclaration
) => {
  if (
    isVariableDeclaration(node) &&
    node.initializer &&
    isArrowFunction(node.initializer)
  ) {
    return (node.initializer as ts.ArrowFunction).body.pos;
  }

  if (isFunctionDeclaration(node) && node.body) {
    return node.body.pos;
  }

  throw new Error(
    "getBlockPosition: Only arrow functions & function declarations are supported"
  );
};

export const returnsJSX = (node: ts.ReturnStatement) => {
  return (
    node.expression?.kind === ts.SyntaxKind.JsxElement ||
    (node.expression?.kind === ts.SyntaxKind.ParenthesizedExpression &&
      (node.expression as ts.ParenthesizedExpression).expression.kind ===
        ts.SyntaxKind.JsxElement)
  );
};
