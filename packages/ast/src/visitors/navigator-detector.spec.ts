import fs from "fs";
import { describe, it, expect, beforeEach } from "bun:test";
import ts from "typescript";
import { NavigatorDetectorVisitor } from "./navigator-detector";

describe("NavigatorDetector visitor", () => {
  describe("single navigator stack with multiple screens", () => {
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

    it("should detect all screens and save references", () => {
      const visitor = new NavigatorDetectorVisitor();
      visitor.visit(file);

      expect(visitor.globalState.stacks).toMatchSnapshot();
    });
  });
});
