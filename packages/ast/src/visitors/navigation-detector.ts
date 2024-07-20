import ts, {
  isBlock,
  isImportSpecifier,
  isPropertyAccessExpression,
  isTypeReferenceNode,
  isVariableDeclaration,
} from "typescript";

import { AbstractVisitor } from "../abstract-visitor";
import {
  getNavigationDestination,
  getNavigationMethodName,
  importSpecifierIsNativeStackScreenPropsType,
  isValidNavigationMethod,
  propertyAccessIsOnNavigation,
  typeReferenceIsNavigationScreenProp,
} from "./utils/navigation-prop";
import {
  getBlockPosition,
  getVarDeclarationName,
  varDeclarationIsPossibleFunctionComponent,
} from "./utils/component";

type NavigationCall = {
  method: "push" | "replace" | "navigate";
  destination: string;
};

type Component = {
  name: string;
  navigationCalls: NavigationCall[];
};

interface GlobalState {
  components: Array<Component>;
}

interface ModuleState {
  checkProps: boolean;
  insideComponentWithNavigationProp: boolean;
  currentComponent: string | undefined;
  currentComponentPosition: number | undefined;
  currentComponentNavigationCalls: NavigationCall[];
}

export class NavigationDetectorVisitor extends AbstractVisitor<
  GlobalState,
  ModuleState
> {
  constructor() {
    super({
      initialGlobalState: {
        components: [],
      },
      initialModuleState: {
        checkProps: false,
        insideComponentWithNavigationProp: false,
        currentComponent: undefined,
        currentComponentPosition: undefined,
        currentComponentNavigationCalls: [],
      },
    });
  }

  cases = [
    this.case(isImportSpecifier, (node, { moduleState }) => {
      if (importSpecifierIsNativeStackScreenPropsType(node)) {
        moduleState.checkProps = true;
      }
    }),

    this.case(isVariableDeclaration, (node, { moduleState }) => {
      if (varDeclarationIsPossibleFunctionComponent(node)) {
        moduleState.currentComponent = getVarDeclarationName(node);
        moduleState.currentComponentPosition = getBlockPosition(node);
      }
    }),

    this.case(isTypeReferenceNode, (node, { moduleState }) => {
      // TODO: handle non-object destructuring binding pattern
      if (moduleState.checkProps && typeReferenceIsNavigationScreenProp(node)) {
        moduleState.insideComponentWithNavigationProp = true;
      }
    }),

    // TODO: handle when navigation prop is destructured
    this.case(isPropertyAccessExpression, (node, { moduleState }) => {
      if (propertyAccessIsOnNavigation(node)) {
        // TODO: capture destination screen and component name reference to establish link
        // using push, replace, navigate methods
        const method = getNavigationMethodName(node);
        if (isValidNavigationMethod(method)) {
          moduleState.currentComponentNavigationCalls.push({
            method,
            destination: getNavigationDestination(node),
          });
        }
      }
    }),

    this.case(isBlock, {
      onExit: (node, { moduleState, globalState }) => {
        if (
          this.insideComponent() &&
          node.pos === moduleState.currentComponentPosition
        ) {
          globalState.components.push({
            name: moduleState.currentComponent!,
            navigationCalls:
              moduleState.currentComponentNavigationCalls.slice(),
          });
          moduleState.currentComponent = undefined;
          moduleState.currentComponentPosition = undefined;
          moduleState.currentComponentNavigationCalls = [];
          moduleState.insideComponentWithNavigationProp = false;
        }
      },
    }),
  ];

  private insideComponent = () => {
    return (
      this.moduleState.currentComponent !== undefined &&
      this.moduleState.insideComponentWithNavigationProp
    );
  };
}
