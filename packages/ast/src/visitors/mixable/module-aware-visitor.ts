import {
  isIdentifier,
  isImportDeclaration,
  isImportSpecifier,
  isNamedImports,
  isSourceFile,
  isStringLiteral,
} from "typescript";
import { type BaseVisitorOptions } from "../abstract/base-visitor";
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

export class ModuleAwareVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> extends MixableVisitor<GlobalState, ModuleState & ModuleAwareState> {
  static getSourceForImport(state: ModuleAwareState, importName: string) {
    return state.imports.find((imported) =>
      imported.identifiers.includes(importName)
    )?.source;
  }

  constructor(options: BaseVisitorOptions<GlobalState, ModuleState> = {}) {
    super({
      initialGlobalState: {
        ...options.initialGlobalState,
      } as GlobalState,
      initialModuleState: {
        ...options.initialModuleState,
        currentSourceFile: "",
        imports: [] as ModuleAwareState["imports"],
      } as ModuleState & ModuleAwareState,
    });
  }

  get mixinCases() {
    return [
      this.case(isSourceFile, (node, { moduleState }) => {
        moduleState.currentSourceFile = node.fileName;
      }),

      this.case(isImportDeclaration, (node, { moduleState }) => {
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
          moduleState.imports.push({
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
            moduleState.imports.push({
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
