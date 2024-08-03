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

  it('should callback with source files with "onSourceFile" option', () => {
    const callbacks: string[] = [];
    createProgramLookup("submodules/react-navigation/example/src", {
      rootPath,
      onSourceFile: (sourceFile) => {
        callbacks.push(sourceFile.fileName);
      },
    });
    expect(callbacks).toMatchSnapshot();
  });
});
