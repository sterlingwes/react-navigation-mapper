import { operator, types } from "putout";

export default {
  report: () => `remove unreachable condition`,
  include: () => ["IfStatement"],
  fix: (path) => {
    path.remove();
  },
  filter: (path) => {
    if (
      types.isBooleanLiteral(path.node.test) &&
      path.node.test.value === false
    ) {
      return true;
    }

    return false;
  },
};
