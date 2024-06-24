import { types } from "putout";

const allowedImports = /@react-navigation|react-native/;

export default {
  report: () => `only navigation-related imports`,
  replace: () => ({
    'import __imports from "__a"': (vars, path) => {
      if (allowedImports.test(vars.__a.value) === false) {
        const flipperHook = (vars.__imports ?? [])
          .filter((named) => types.isImportSpecifier(named))
          .find((named) => named?.imported?.name === "useFlippers");
        if (flipperHook) {
          return path;
        }
        return "";
      }

      return path;
    },
  }),
  include: () => ["ImportDeclaration"],
};
