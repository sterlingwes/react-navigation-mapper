import ts, {
  isBlock,
  isCallExpression,
  isImportSpecifier,
  isPropertyAccessExpression,
  isTypeReferenceNode,
} from "typescript";

import {
  getNavigationDestination,
  getNavigationHookReturn,
  getNavigationMethodName,
  importSpecifierIsNativeStackScreenPropsType,
  isValidNavigationMethod,
  propertyAccessIsOnNavigation,
  typeReferenceIsNavigationScreenProp,
} from "./utils/navigation-prop";
import { ModuleTrackingMixin } from "./mixable/module-tracking-mixin";
import { BaseVisitor } from "./abstract/base-visitor";
import { ComponentTrackingMixin } from "./mixable/component-tracking-mixin";

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
  navigationPropName: string;
  insideComponentWithNavigationProp: boolean;
  currentComponentNavigationCalls: NavigationCall[];
}

interface PublicOptions {
  navigationHookName?: string;
}

export class NavigationDetectorVisitor extends BaseVisitor<
  GlobalState,
  ModuleState
> {
  private componentTracking = new ComponentTrackingMixin();
  private moduleTracking = new ModuleTrackingMixin();

  constructor(options: PublicOptions = {}) {
    super({
      initialGlobalState: {
        components: [],
      },
      initialModuleState: {
        checkProps: false,
        navigationPropName: "navigation",
        insideComponentWithNavigationProp: false,
        currentComponentNavigationCalls: [],
      },
    });

    const navigationHookName = options.navigationHookName || "useNavigation";

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

      this.case(isCallExpression, (node, { moduleState }) => {
        const navHookReturn = getNavigationHookReturn(node, navigationHookName);
        if (navHookReturn) {
          moduleState.navigationPropName = navHookReturn;
          moduleState.insideComponentWithNavigationProp = true;
        }
      }),

      // TODO: handle when navigation prop is destructured
      this.case(isPropertyAccessExpression, (node, { moduleState }) => {
        if (
          moduleState.insideComponentWithNavigationProp &&
          propertyAccessIsOnNavigation(
            node,
            this.moduleState.navigationPropName
          )
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
            node.pos === this.componentTracking.position?.[0]
          ) {
            globalState.components.push({
              name: this.componentTracking.current!,
              navigationCalls:
                moduleState.currentComponentNavigationCalls.slice(),
              source: this.moduleTracking.currentSourceFile,
            });
            moduleState.currentComponentNavigationCalls = [];
            moduleState.insideComponentWithNavigationProp = false;
          }
        },
      }),
    ]);

    this.mixins.add(this.componentTracking);
    this.mixins.add(this.moduleTracking);
  }

  private insideComponent = () => {
    return this.componentTracking.current !== undefined;
  };
}
