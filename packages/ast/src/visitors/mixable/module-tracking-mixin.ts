import {
  isIdentifier,
  isImportDeclaration,
  isImportSpecifier,
  isNamedImports,
  isSourceFile,
  isStringLiteral,
} from "typescript";

import { MixableVisitor } from "../abstract/mixable-visitor";

type Import = {
  type: "named" | "default" | "namespace";
  identifiers: string[];
  source: string;
};

interface ModuleAwareState extends Record<any, any> {
  currentSourceFile: string;
  imports: Import[];
}

/**
 * principles: state separation but easy access to mixin state
 *
 * mixins do not affect global state, it's up to the visitor objects to decide what state is global
 */

export class ModuleTrackingMixin extends MixableVisitor<any, any> {
  private state: ModuleAwareState = {
    currentSourceFile: "",
    imports: [],
  };

  get currentSourceFile() {
    return this.state.currentSourceFile;
  }

  get mixinCases() {
    return [
      this.case(isSourceFile, (node) => {
        this.state.currentSourceFile = node.fileName;
      }),

      this.case(isImportDeclaration, (node) => {
        const importClause = node.importClause;
        const namedIdentifiers: string[] = [];
        const source = isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : "";

        if (
          importClause &&
          importClause.name &&
          isIdentifier(importClause.name)
        ) {
          this.state.imports.push({
            type: "default",
            identifiers: [importClause.name.escapedText as string],
            source,
          });
          return;
        }

        if (
          importClause &&
          importClause.namedBindings &&
          isNamedImports(importClause.namedBindings)
        ) {
          importClause.namedBindings.elements.forEach((element) => {
            if (isImportSpecifier(element) && isIdentifier(element.name)) {
              namedIdentifiers.push(element.name.escapedText as string);
            }
          });

          if (namedIdentifiers.length) {
            this.state.imports.push({
              type: "named",
              identifiers: namedIdentifiers,
              source,
            });
          }
        }
      }),
    ];
  }
}
