import * as path from "path";
import { describe, it, expect } from "bun:test";
import { createProgramLookup } from "./program";

const rootPath = path.resolve(__dirname, "../../../");

describe("createProgramLookup", () => {
  it("should return the program and files lookup", () => {
    const { program, files } = createProgramLookup(
      "submodules/react-navigation/example/src",
      { rootPath }
    );
    expect(files).toMatchSnapshot();
  });
});
