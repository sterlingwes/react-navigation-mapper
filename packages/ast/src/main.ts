import type { SourceFile } from "typescript";
import { NavigationDetectorVisitor } from "./visitors/navigation-detector";
import { NavigatorDetectorVisitor } from "./visitors/navigator-detector";

export const parseFile = (sourceFile: SourceFile) => {
  // TODO: allow for running through the file once with multiple visitors

  const navigationVisitor = new NavigationDetectorVisitor();
  navigationVisitor.visit(sourceFile);
  const { components } = navigationVisitor.globalState;

  const navigatorVisitor = new NavigatorDetectorVisitor();
  navigatorVisitor.visit(sourceFile);
  const { stacks } = navigatorVisitor.globalState;
  const skippable = Object.keys(stacks).length === 0 && components.length === 0;

  return { components, stacks, source: sourceFile.fileName, skippable };
};
