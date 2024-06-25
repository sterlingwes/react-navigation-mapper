import { globSync } from "glob";
import { describe, it, expect } from "bun:test";

import { shakeFile } from "../src/main";
import { expectNoTypeScriptErrors } from "./utils";

describe("react-navigation example app", () => {
  const paths = globSync("submodules/react-navigation/example/src/**/*.tsx");
  paths.forEach((file) => {
    describe(file, () => {
      it("should", async () => {
        const code = await shakeFile(file);
        expect(code).toMatchSnapshot();
        expectNoTypeScriptErrors(code);
      });
    });
  });
});
