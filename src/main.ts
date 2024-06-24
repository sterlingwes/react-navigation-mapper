import putout from "putout";
import * as prettier from "prettier";
import fs from "fs";

export const shakeFile = async (filePath: string) => {
  console.log(`Shaking ${filePath}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const { code } = putout(content, {
    isTS: true,
    plugins: [
      ["remove-imports", require("./rules/remove-imports").default],
      [
        "unwrap-undeclared-hooks",
        require("./rules/unwrap-react-hooks").default,
      ],
      [
        "remove-undeclared-var-calls",
        require("./rules/remove-undeclared-var-calls").default,
      ],
      [
        "remove-unreachable-condition",
        require("./rules/remove-unreachable-condition").default,
      ],
      [
        "remove-undeclared-types",
        require("./rules/remove-undeclared-types").default,
      ],

      "remove-unused-variables",
      "remove-unused-expressions",
      "remove-unreachable-code",
      "remove-unreferenced-variables",
    ],
  });

  return prettier.format(code, { parser: "typescript" });
};
