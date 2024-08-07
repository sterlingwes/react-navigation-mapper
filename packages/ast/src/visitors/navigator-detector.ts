import {
  isCallExpression,
  isIdentifier,
  isImportSpecifier,
  isJsxAttribute,
  isJsxSelfClosingElement,
  isPropertyAssignment,
} from "typescript";

import {
  resolveNavigationStackImportFactoryName,
  resolveNavigatorNamespaceFromFactoryCall,
} from "./utils/navigators";
import { jsxElementIsScreen } from "./utils/stack-screen";
import { BaseVisitor } from "./abstract/base-visitor";
import { ComponentTrackingMixin } from "./mixable/component-tracking-mixin";
import { getPrimitiveValue } from "./utils/values";
import {
  getJsxAttributeWithArrowFunctionValue,
  getJsxAttributeWithIdentifierValueAsString,
  getJsxAttributeWithObjectLiteralValue,
  getJsxAttributeWithStringValue,
} from "./utils/jsx";
import { ModuleTrackingMixin } from "./mixable/module-tracking-mixin";
import { defaultStackFactories } from "./constants/stack-factories";

type Screen = {
  name: string;
  component: string;
  importPath?: string;
  options?: Record<string, unknown>;
};

type Stack = {
  name: string;
  namespace: string;
  screens: Array<Screen>;
  source: string;
};

interface GlobalState {
  stacks: Record<string, Stack>;
}

interface ModuleState {
  stackFactory: string;
  stackNamespace: string;
  stackComponentName: string;
}

interface PublicOptions {
  stackFactories?: Record<string, string>;
}

/**
 * currently assumes the full navigator is defined in the same module file
 */
export class NavigatorDetectorVisitor extends BaseVisitor<
  GlobalState,
  ModuleState
> {
  private componentTracking = new ComponentTrackingMixin();
  private moduleTracking = new ModuleTrackingMixin();

  constructor(options: PublicOptions = {}) {
    super({
      initialGlobalState: {
        stacks: {},
      },
      initialModuleState: {
        stackFactory: "",
        stackNamespace: "",
        stackComponentName: "",
      },
    });

    const stackFactoryLookup = options?.stackFactories ?? defaultStackFactories;

    this.addVisitorCases([
      this.case(isImportSpecifier, (node, { moduleState }) => {
        const factoryMatch = resolveNavigationStackImportFactoryName(
          node,
          stackFactoryLookup
        );
        if (factoryMatch) {
          moduleState.stackFactory = factoryMatch;
        }
      }),

      this.case(isCallExpression, (node, { moduleState }) => {
        const namespaceMatch = resolveNavigatorNamespaceFromFactoryCall(
          node,
          moduleState.stackFactory
        );
        if (namespaceMatch) {
          moduleState.stackNamespace = namespaceMatch;
        }
      }),

      // TODO: handle destructuring of Screen instead of property access on stack identifier
      this.case(isJsxSelfClosingElement, (node, { moduleState }) => {
        if (jsxElementIsScreen(node, moduleState.stackNamespace)) {
          const screen: Screen = { name: "", component: "" };
          node.attributes.properties.forEach((attr) => {
            if (!isJsxAttribute(attr) || !isIdentifier(attr.name)) return;

            const attributeStringValue = getJsxAttributeWithStringValue(attr);
            if (attr.name.escapedText === "name" && attributeStringValue) {
              screen.name = attributeStringValue;
              return;
            }

            const attributeIdentifierStringValue =
              getJsxAttributeWithIdentifierValueAsString(attr);
            if (
              attr.name.escapedText === "component" &&
              attributeIdentifierStringValue
            ) {
              screen.component = attributeIdentifierStringValue;
              screen.importPath = this.moduleTracking.getImportForIdentifier(
                attributeIdentifierStringValue
              )?.source;
              return;
            }

            const attributeObjectValue =
              getJsxAttributeWithObjectLiteralValue(attr) ||
              getJsxAttributeWithArrowFunctionValue(attr);
            if (attr.name.escapedText === "options" && attributeObjectValue) {
              screen.options = attributeObjectValue.properties.reduce(
                (acc, prop) => {
                  if (!isPropertyAssignment(prop)) return acc;
                  if (isIdentifier(prop.name) && prop.initializer) {
                    acc[prop.name.escapedText as string] = getPrimitiveValue(
                      prop.initializer
                    );
                  }
                  return acc;
                },
                {} as Record<string, unknown>
              );
              return;
            }
          });

          if (screen.name && screen.component) {
            this.addScreen(screen);
          }
        }
      }),
    ]);

    this.mixins.add(this.componentTracking);
    this.mixins.add(this.moduleTracking);
  }

  private addScreen(screen: Screen) {
    const component = this.ensureComponent(`when adding screen ${screen.name}`);

    if (!this.globalState.stacks[component]) {
      this.initializeStack(component);
    }

    const { stacks } = this.globalState;
    stacks[component] = {
      ...stacks[component],
      screens: [...stacks[component].screens, screen],
    };
  }

  private initializeStack(namespace: string) {
    const component = this.ensureComponent(
      `when initializing stack ${namespace}`
    );

    if (!this.globalState.stacks[namespace]) {
      this.globalState.stacks[component] = {
        name: component,
        namespace,
        screens: [],
        source: this.moduleTracking.currentSourceFile,
      };
    } else {
      console.warn(
        `Stack ${namespace} already exists, visitor in unexpected state`
      );
    }
  }

  private ensureComponent(detail = "") {
    const component = this.componentTracking.current;
    if (!component) {
      throw new Error(`No component name set, expected to find one: ${detail}`);
    }

    return component;
  }
}
