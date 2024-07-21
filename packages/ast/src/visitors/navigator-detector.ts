import {
  isCallExpression,
  isIdentifier,
  isImportSpecifier,
  isJsxAttribute,
  isJsxExpression,
  isJsxSelfClosingElement,
  isStringLiteral,
} from "typescript";

import {
  resolveNavigationStackImportFactoryName,
  resolveNavigatorNamespaceFromFactoryCall,
} from "./utils/navigators";
import { jsxElementIsScreen } from "./utils/stack-screen";
import { ComponentAwareVisitor } from "./mixable/component-aware-visitor";

type Screen = {
  name: string;
  component: string;
};

type Stack = {
  name: string;
  namespace: string;
  screens: Array<Screen>;
};

interface GlobalState {
  stacks: Record<string, Stack>;
}

interface ModuleState {
  stackFactory: string;
  stackNamespace: string;
  stackComponentName: string;
}

// check if import specifier exists
// if so, check if factory is called and track identifier
// if so, check for identifier in JSX tags
// if so, capture params passed to those components as screen routes
//
// maybe this query lib can help? https://github.com/phenomnomnominal/tsquery
// can filter to files that have the import specifier then query further

export class NavigatorDetectorVisitor extends ComponentAwareVisitor<
  GlobalState,
  ModuleState
> {
  constructor() {
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

    this.addVisitorCases([
      this.case(isImportSpecifier, (node, { moduleState }) => {
        const factoryMatch = resolveNavigationStackImportFactoryName(node);
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

            if (
              attr.name.escapedText === "name" &&
              attr.initializer &&
              // TODO: handle other cases besides string literal
              isStringLiteral(attr.initializer)
            ) {
              screen.name = attr.initializer.text;
            }

            if (
              attr.name.escapedText === "component" &&
              attr.initializer &&
              isJsxExpression(attr.initializer) &&
              attr.initializer.expression &&
              isIdentifier(attr.initializer.expression)
            ) {
              screen.component = attr.initializer.expression
                .escapedText as string;
            }
          });

          if (screen.name && screen.component) {
            this.addScreen(screen);
          }
        }
      }),
    ]);
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
      };
    } else {
      console.warn(
        `Stack ${namespace} already exists, visitor in unexpected state`
      );
    }
  }

  private ensureComponent(detail = "") {
    const component = this.moduleState.currentComponent;
    if (!component) {
      throw new Error(`No component name set, expected to find one: ${detail}`);
    }

    return component;
  }
}
