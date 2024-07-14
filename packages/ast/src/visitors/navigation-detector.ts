import ts from "typescript";

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
  returnsJSX,
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

  visitor(
    node: ts.Node,
    context: { globalState: GlobalState; moduleState: ModuleState },
    forEachChild: (node: ts.Node) => void
  ) {
    const { moduleState } = context;

    // if (
    //   moduleState.insideComponentWithNavigationProp &&
    //   [ts.SyntaxKind.Identifier].includes(node.kind) === false
    // ) {
    //   console.log(ts.SyntaxKind[node.kind]);
    // }

    const insideComponent = () => {
      return (
        moduleState.currentComponent !== undefined &&
        moduleState.insideComponentWithNavigationProp
      );
    };

    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration:
        const varDec = node as ts.VariableDeclaration;
        if (varDeclarationIsPossibleFunctionComponent(varDec)) {
          moduleState.currentComponent = getVarDeclarationName(varDec);
          moduleState.currentComponentPosition = getBlockPosition(varDec);
        }
        break;
      case ts.SyntaxKind.ImportSpecifier:
        const importSpecifier = node as ts.ImportSpecifier;
        if (importSpecifierIsNativeStackScreenPropsType(importSpecifier)) {
          moduleState.checkProps = true;
        }
        break;
      case ts.SyntaxKind.TypeReference:
        // TODO: handle non-object destructuring binding pattern
        if (
          moduleState.checkProps &&
          typeReferenceIsNavigationScreenProp(node as ts.TypeReferenceNode)
        ) {
          moduleState.insideComponentWithNavigationProp = true;
        }
        break;
      // TODO: handle when navigation prop is destructured
      case ts.SyntaxKind.PropertyAccessExpression:
        const propAccess = node as ts.PropertyAccessExpression;
        if (propertyAccessIsOnNavigation(propAccess)) {
          // TODO: capture destination screen and component name reference to establish link
          // using push, replace, navigate methods
          const method = getNavigationMethodName(propAccess);
          if (isValidNavigationMethod(method)) {
            context.moduleState.currentComponentNavigationCalls.push({
              method,
              destination: getNavigationDestination(propAccess),
            });
          }
        }
        break;
    }

    forEachChild(node);

    if (
      node.kind === ts.SyntaxKind.Block &&
      insideComponent() &&
      node.pos === moduleState.currentComponentPosition
    ) {
      context.globalState.components.push({
        name: moduleState.currentComponent!,
        navigationCalls: moduleState.currentComponentNavigationCalls.slice(),
      });
      moduleState.currentComponent = undefined;
      moduleState.currentComponentPosition = undefined;
      moduleState.currentComponentNavigationCalls = [];
      moduleState.insideComponentWithNavigationProp = false;
    }
  }
}
