import { globSync } from "glob";
import { readFileSync } from "fs";
import * as ts from "typescript";

export function delint(sourceFile: ts.SourceFile) {
  let checkProps = false;
  let insideComponentWithNavigationProp = false;
  // TODO: capture component name and attribute navigate calls to it in a map
  // using "insideComponentWithNavigationProp" to delimit the component "scope"
  // and the typereference match to crawl up the parent node and get the component name

  delintNode(sourceFile);

  function delintNode(node: ts.Node) {
    if (
      insideComponentWithNavigationProp &&
      [ts.SyntaxKind.Identifier].includes(node.kind) === false
    ) {
      console.log(ts.SyntaxKind[node.kind]);
    }

    switch (node.kind) {
      case ts.SyntaxKind.ImportSpecifier:
        const importSpecifier = node as ts.ImportSpecifier;
        if (
          importSpecifier.name.escapedText === "NativeStackScreenProps" &&
          importSpecifier.parent.parent.parent.kind ===
            ts.SyntaxKind.ImportDeclaration &&
          (
            importSpecifier.parent.parent.parent
              .moduleSpecifier as ts.StringLiteral
          ).text === "@react-navigation/native-stack"
        ) {
          checkProps = true;
        }
        break;
      case ts.SyntaxKind.TypeReference:
        if (checkProps) {
          const typeReference = node as ts.TypeReferenceNode;
          if (
            typeReference.typeName.kind === ts.SyntaxKind.Identifier &&
            (typeReference.typeName as ts.Identifier).escapedText ===
              "NativeStackScreenProps" &&
            typeReference.parent.kind === ts.SyntaxKind.Parameter &&
            typeReference.parent.name.kind ===
              ts.SyntaxKind.ObjectBindingPattern
          ) {
            insideComponentWithNavigationProp = true;
          }
        }
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        const propAccess = node as ts.PropertyAccessExpression;
        if (
          propAccess.name.escapedText === "navigate" &&
          propAccess.expression.kind === ts.SyntaxKind.Identifier &&
          (propAccess.expression as ts.Identifier).escapedText === "navigation"
        ) {
          console.log("navigate!");
        }
        break;
    }

    ts.forEachChild(node, delintNode);
    if (node.kind === ts.SyntaxKind.ReturnStatement) {
      insideComponentWithNavigationProp = false;
    }
  }
}

const fileNames = globSync("submodules/react-navigation/example/src/**/*.tsx");
fileNames.filter((fileName) => fileName.endsWith("NativeStack.tsx"));
fileNames.forEach((fileName) => {
  // Parse a file
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );

  // delint it
  delint(sourceFile);
});
