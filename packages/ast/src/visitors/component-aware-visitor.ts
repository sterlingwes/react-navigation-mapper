import ts, {
  isBlock,
  isFunctionDeclaration,
  isVariableDeclaration,
} from "typescript";

import {
  AbstractVisitor,
  type AbstractVisitorOptions,
} from "../abstract-visitor";
import {
  functionDeclarationIsPossibleComponent,
  getBlockPosition,
  getFunctionDeclarationName,
  getVarDeclarationName,
  varDeclarationIsPossibleFunctionComponent,
} from "./utils/component";

interface ComponentAwareState extends Record<any, any> {
  currentComponent: string | undefined;
  currentComponentPosition: number | undefined;
}

export class ComponentAwareVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> extends AbstractVisitor<GlobalState, ModuleState & ComponentAwareState> {
  constructor(options: AbstractVisitorOptions<GlobalState, ModuleState>) {
    super({
      initialGlobalState: {
        ...options.initialGlobalState,
      } as GlobalState,
      initialModuleState: {
        ...options.initialModuleState,
        currentComponent: undefined,
        currentComponentPosition: undefined,
      } as ModuleState & ComponentAwareState,
    });

    this.addVisitorCases([
      this.case(isVariableDeclaration, (node, { moduleState }) => {
        if (varDeclarationIsPossibleFunctionComponent(node)) {
          moduleState.currentComponent = getVarDeclarationName(node);
          moduleState.currentComponentPosition = getBlockPosition(node);
        }
      }),

      this.case(isFunctionDeclaration, (node, { moduleState }) => {
        if (functionDeclarationIsPossibleComponent(node)) {
          moduleState.currentComponent = getFunctionDeclarationName(node);
          moduleState.currentComponentPosition = getBlockPosition(node);
        }
      }),

      this.case(isBlock, {
        onExit: (node, { moduleState }) => {
          if (
            moduleState.currentComponent !== undefined &&
            node.pos === moduleState.currentComponentPosition
          ) {
            // run our cleanup after subclassed exit logic for blocks
            return () => {
              moduleState.currentComponent = undefined;
              moduleState.currentComponentPosition = undefined;
            };
          }
        },
      }),
    ]);
  }
}
