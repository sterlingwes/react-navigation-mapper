import ts from "typescript";

export const jsxElementIsScreen = (
  node: ts.JsxSelfClosingElement,
  stackName: string
) => {
  if (
    ts.isPropertyAccessExpression(node.tagName) &&
    ts.isIdentifier(node.tagName.name) &&
    ts.isIdentifier(node.tagName.expression)
  ) {
    return (
      node.tagName.name.escapedText === "Screen" &&
      node.tagName.expression.escapedText === stackName
    );
  }
};
