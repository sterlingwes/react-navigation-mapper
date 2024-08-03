import {
  isArrowFunction,
  isIdentifier,
  isJsxAttribute,
  isJsxExpression,
  isObjectLiteralExpression,
  isParenthesizedExpression,
  isStringLiteral,
  type JsxAttribute,
  type Node,
} from "typescript";

export const getJsxAttributeWithStringValue = (attr: Node) => {
  if (
    isJsxAttribute(attr) &&
    attr.initializer &&
    isStringLiteral(attr.initializer)
  ) {
    return attr.initializer.text;
  }
};

export const getJsxAttributeWithObjectLiteralValue = (attr: Node) => {
  if (
    isJsxAttribute(attr) &&
    attr.initializer &&
    isJsxExpression(attr.initializer) &&
    attr.initializer.expression &&
    isObjectLiteralExpression(attr.initializer.expression)
  ) {
    return attr.initializer.expression;
  }
};

export const getJsxAttributeWithIdentifierValueAsString = (attr: Node) => {
  if (
    isJsxAttribute(attr) &&
    attr.initializer &&
    isJsxExpression(attr.initializer) &&
    attr.initializer.expression &&
    isIdentifier(attr.initializer.expression)
  ) {
    return attr.initializer.expression.escapedText as string;
  }
};

export const getJsxAttributeWithArrowFunctionValue = (attr: Node) => {
  // TODO handle case with return statement vs. inline return
  if (
    isJsxAttribute(attr) &&
    attr.initializer &&
    isJsxExpression(attr.initializer) &&
    attr.initializer.expression &&
    isArrowFunction(attr.initializer.expression) &&
    isParenthesizedExpression(attr.initializer.expression.body) &&
    isObjectLiteralExpression(attr.initializer.expression.body.expression)
  ) {
    return attr.initializer.expression.body.expression;
  }
};
