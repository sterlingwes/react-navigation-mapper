import { operator, types } from "putout";

export default {
  report: () => `Remove unreferenced calls`,
  include: () => ["CallExpression"],
  fix: (path) => {
    const firstArg = path.node.arguments[0];
    if (
      path.node.arguments.length <= 2 &&
      types.isArrowFunctionExpression(firstArg)
    ) {
      operator.replaceWith(path, firstArg);
      return;
    }

    let parent = path.parentPath;
    if (types.isVariableDeclaration(parent.node)) {
      parent.remove();
      return;
    }

    parent = parent.parentPath;
    if (types.isVariableDeclaration(parent.node)) {
      parent.remove();
      return;
    }
  },
  filter: (path) => {
    if (types.isIdentifier(path.node.callee)) {
      const bindings = path.scope.getAllBindings();
      const name = operator.extract(path.node.callee);
      const bound = bindings[name];
      return !bound && name.startsWith("use");
    }

    return false;
  },
};
