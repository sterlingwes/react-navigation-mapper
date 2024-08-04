import ts, {
  isArrowFunction,
  isFunctionDeclaration,
  isIdentifier,
  isVariableDeclaration,
} from "typescript";

const hasComponentName = (name: string) => /^[A-Z]/.test(name);

export const varDeclarationIsPossibleFunctionComponent = (
  node: ts.VariableDeclaration
) => {
  return (
    (isIdentifier(node.name) &&
      node.name.escapedText &&
      hasComponentName(node.name.escapedText as string) &&
      node.initializer?.kind === ts.SyntaxKind.ArrowFunction) ||
    node.initializer?.kind === ts.SyntaxKind.FunctionExpression
  );
};

export const functionDeclarationIsPossibleComponent = (
  node: ts.FunctionDeclaration
) => {
  return (
    node.name &&
    ts.isIdentifier(node.name) &&
    hasComponentName(node.name.escapedText as string) &&
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
    const { pos, end } = node.initializer.body;
    return [pos, end] as const;
  }

  if (isFunctionDeclaration(node) && node.body) {
    return [node.body.pos, node.body.end] as const;
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
