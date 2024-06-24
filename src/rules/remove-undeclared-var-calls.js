import { operator, types } from "putout";

export default {
  report: () => `remove undeclared calls`,
  include: () => ["CallExpression"],
  fix: (path) => {
    if (types.isAwaitExpression(path.parent)) {
      return path.parentPath.remove();
    }

    if (types.isUnaryExpression(path.parent)) {
      return operator.replaceWith(path.parentPath, types.booleanLiteral(false));
    }

    path.remove();
  },
  filter: (path) => {
    const bindings = path.scope.getAllBindings();

    if (
      types.isMemberExpression(path.node.callee) &&
      types.isIdentifier(path.node.callee.object)
    ) {
      const name = operator.extract(path.node.callee.object);
      const bound = bindings[name] || global[name];
      return !bound;
    }

    if (
      types.isExpressionStatement(path.parent) &&
      types.isIdentifier(path.node.callee)
    ) {
      const name = operator.extract(path.node.callee);
      const bound = bindings[name] || global[name];
      return !bound;
    }

    return false;
  },
};
