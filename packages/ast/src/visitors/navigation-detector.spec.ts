import fs from "fs";
import { describe, it, expect, beforeEach } from "bun:test";
import ts from "typescript";
import { NavigationDetectorVisitor } from "./navigation-detector";

describe("NavigationDetector visitor", () => {
  describe("multi screen simple navigate calls", () => {
    let file: ts.SourceFile;

    beforeEach(() => {
      const fileName =
        "submodules/react-navigation/example/src/Screens/NativeStack.tsx";
      file = ts.createSourceFile(
        fileName,
        fs.readFileSync(fileName).toString(),
        ts.ScriptTarget.ES2015,
        /*setParentNodes */ true
      );
    });

    it("should detect all components & navigation calls", () => {
      const visitor = new NavigationDetectorVisitor();
      visitor.visit(file);

      expect(visitor.globalState.components).toMatchSnapshot();
    });
  });
});
