import ts from "typescript";

export interface AbstractVisitorOptions<GlobalState, ModuleState> {
  initialGlobalState?: GlobalState;
  initialModuleState?: ModuleState;
}

// TODO: add getAndReset moduleState which can be called after visiting a whole file
// TODO: add getAndReset globalState whcih can be called after visiting a whole project

export abstract class AbstractVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> {
  private options: {
    globalState: GlobalState;
    moduleState: ModuleState;
  };

  constructor(options: AbstractVisitorOptions<GlobalState, ModuleState>) {
    this.options = {
      globalState: options.initialGlobalState ?? ({} as Record<any, any>),
      moduleState: options.initialModuleState ?? ({} as Record<any, any>),
    };
  }

  getGlobalState() {
    return this.options.globalState;
  }

  visit(node: ts.Node) {
    const { globalState, moduleState } = this.options;
    const context = {
      globalState,
      moduleState,
    };
    this.visitor(node, context, (node: ts.Node) =>
      ts.forEachChild(node, (childNode) => this.visit(childNode))
    );
  }

  abstract visitor(
    node: ts.Node,
    context: { globalState: GlobalState; moduleState: ModuleState },
    forEachChild: (node: ts.Node) => void
  ): void;
}
