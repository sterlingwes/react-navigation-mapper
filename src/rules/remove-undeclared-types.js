import { operator, types } from "putout";

export default {
  report: () => `remove undeclared types`,
  include: () => ["TSTypeReference"],
  fix: (path) => {
    operator.replaceWith(path, types.tsAnyKeyword());
  },
  filter: (path) => {
    const bindings = path.scope.getAllBindings();
    if (
      types.isIdentifier(path.node.typeName) &&
      !bindings[path.node.typeName.name]
    ) {
      return true;
    }

    return false;
  },
};
