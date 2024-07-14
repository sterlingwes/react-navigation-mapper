import ts from "typescript";

export const varDeclarationIsPossibleFunctionComponent = (
  node: ts.VariableDeclaration
) => {
  return (
    node.initializer?.kind === ts.SyntaxKind.ArrowFunction ||
    node.initializer?.kind === ts.SyntaxKind.FunctionExpression
  );
};

export const getVarDeclarationName = (node: ts.VariableDeclaration) => {
  return (node.name as ts.Identifier).escapedText as string;
};

export const getBlockPosition = (node: ts.VariableDeclaration) => {
  if (node.initializer?.kind === ts.SyntaxKind.ArrowFunction) {
    return (node.initializer as ts.ArrowFunction).body.pos;
  }

  throw new Error("getBlockPosition: Only arrow functions are supported");
};

export const returnsJSX = (node: ts.ReturnStatement) => {
  return (
    node.expression?.kind === ts.SyntaxKind.JsxElement ||
    (node.expression?.kind === ts.SyntaxKind.ParenthesizedExpression &&
      (node.expression as ts.ParenthesizedExpression).expression.kind ===
        ts.SyntaxKind.JsxElement)
  );
};
