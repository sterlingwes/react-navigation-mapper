import putout from "putout";
import fs from "fs";

// extract navigation calls and associate with action / function name
// remove everything else other than navigation hierarchy references
// hoist navigation calls to make them executable (necessary? or just static analysis?)
// extract flippers used in file and associate with conditional navigation calls
// do we need to hoist or can we expose to specs with static assignment to screen / exported function
// need to be able to inject flipper values to track calls

const sampleCode = fs.readFileSync("fixtures/simple-nav.js", "utf-8");

const result = putout(sampleCode, {
  plugins: [
    ["remove-imports", require("./src/rules/remove-imports").default],
    [
      "unwrap-undeclared-hooks",
      require("./src/rules/unwrap-react-hooks").default,
    ],
    [
      "calls on undeclared vars",
      require("./src/rules/remove-undeclared-var-calls").default,
    ],

    "remove-unused-variables",
    "remove-unused-expressions",
    "remove-unreachable-code",
    "remove-unreferenced-variables",
  ],
});

fs.writeFileSync("output.js", result.code);

// [
//   "calls undeclared JSX component",
//   {
//     report: () => `remove undeclared JSX components`,
//     include: () => ["JSXElement"],
//     fix: (path) => {
//       path.remove();
//     },
//     filter: (path) => {
//       const bindings = path.scope.getAllBindings();
//       const name = operator.extract(path.node.openingElement.name);
//       const bound = bindings[name];
//       return !bound;
//     },
//   },
// ],
// [
//   "unrefed",
//   {
//     report: ({ name }) => `Undeclared variable ${name}`,
//     fix: (path) => {
//       // console.log(path.node.name, path.node.type, path.parent.type);
//       // operator.remove(path)
//     },
//     traverse: ({ push, pathStore }) => ({
//       "__a(__args)": (path) => {
//         const bindings = path.scope.getAllBindings();
//         const binding = bindings[path.node.name];
//         console.log(path.node.name, "?", Object.keys(bindings));
//         if (!binding) {
//           return false;
//         }
//         push(path);
//       },

//       // Identifier: pathStore,
//       // Program: {
//       //   exit(path) {
//       //     const ids = pathStore().filter(isIdentifier);
//       //     console.log("ids", ids.map((id) => id)[0]);
//       //   },
//       // },
//     }),
//     include: () => ["VariableDeclaration"],
//   },
// ],
// [
//   "hoist-navigation-calls",
//   {
//     report: ({ name }) => `Hoisting nav call ${name}`,
//     replace: () => ({
//       "navigation.navigate(__args)": (vars, path) => {
//         console.log(
//           ">>",
//           path.getFunctionParent().getFunctionParent().node
//         );
//         return path;
//       },
//     }),
//   },
// ],
