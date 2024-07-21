import ts, {
  isBlock,
  isImportSpecifier,
  isPropertyAccessExpression,
  isTypeReferenceNode,
} from "typescript";

import {
  getNavigationDestination,
  getNavigationMethodName,
  importSpecifierIsNativeStackScreenPropsType,
  isValidNavigationMethod,
  propertyAccessIsOnNavigation,
  typeReferenceIsNavigationScreenProp,
} from "./utils/navigation-prop";
import { ComponentAwareVisitor } from "./component-aware-visitor";
import { ModuleAwareVisitor } from "./module-aware-visitor";

type NavigationCall = {
  method: "push" | "replace" | "navigate";
  destination: string;
};

type Component = {
  name: string;
  navigationCalls: NavigationCall[];
  source: string;
};

interface GlobalState {
  components: Array<Component>;
}

interface ModuleState {
  checkProps: boolean;
  insideComponentWithNavigationProp: boolean;
  currentComponentNavigationCalls: NavigationCall[];
}

export class NavigationDetectorVisitor extends ComponentAwareVisitor<
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
        currentComponentNavigationCalls: [],
      },
    });

    this.addVisitorCases([
      this.case(isImportSpecifier, (node, { moduleState }) => {
        if (importSpecifierIsNativeStackScreenPropsType(node)) {
          moduleState.checkProps = true;
        }
      }),

      this.case(isTypeReferenceNode, (node, { moduleState }) => {
        // TODO: handle non-object destructuring binding pattern
        if (
          moduleState.checkProps &&
          typeReferenceIsNavigationScreenProp(node)
        ) {
          moduleState.insideComponentWithNavigationProp = true;
        }
      }),

      // TODO: handle when navigation prop is destructured
      this.case(isPropertyAccessExpression, (node, { moduleState }) => {
        if (
          moduleState.insideComponentWithNavigationProp &&
          propertyAccessIsOnNavigation(node)
        ) {
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
              source: moduleState.currentSourceFile,
            });
            moduleState.currentComponentNavigationCalls = [];
            moduleState.insideComponentWithNavigationProp = false;
          }
        },
      }),
    ]).withMixin(new ModuleAwareVisitor());
  }

  private insideComponent = () => {
    return this.moduleState.currentComponent !== undefined;
  };
}
