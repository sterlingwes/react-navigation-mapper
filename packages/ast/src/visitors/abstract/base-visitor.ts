import ts from "typescript";

export interface BaseVisitorOptions<GlobalState, ModuleState> {
  initialGlobalState?: GlobalState;
  initialModuleState?: ModuleState;
}

// TODO: add getAndReset moduleState which can be called after visiting a whole file
// TODO: add getAndReset globalState whcih can be called after visiting a whole project

interface Mixin<GlobalState, ModuleState> {
  get globalState(): GlobalState;
  get moduleState(): ModuleState;
  get mixinCases(): (typeof BaseVisitor.prototype)["cases"];
}

export abstract class BaseVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> {
  private options: {
    globalState: GlobalState;
    moduleState: ModuleState;
  };

  private cases: Array<
    readonly [
      (node: any) => any,
      (
        | ((
            node: any,
            context: { globalState: GlobalState; moduleState: ModuleState }
          ) => any)
        | {
            onEnter?: (
              node: any,
              context: { globalState: GlobalState; moduleState: ModuleState }
            ) => any;
            onExit?: (
              node: any,
              context: { globalState: GlobalState; moduleState: ModuleState }
            ) => any;
          }
      ),
    ]
  > = [];

  constructor(options: BaseVisitorOptions<GlobalState, ModuleState> = {}) {
    this.options = {
      globalState: options.initialGlobalState ?? ({} as Record<any, any>),
      moduleState: options.initialModuleState ?? ({} as Record<any, any>),
    };
  }

  get globalState() {
    return this.options.globalState;
  }

  get moduleState() {
    return this.options.moduleState;
  }

  get context(): {
    globalState: GlobalState;
    moduleState: ModuleState;
  } {
    return {
      globalState: this.globalState,
      moduleState: this.moduleState,
    };
  }

  addVisitorCases(cases: typeof this.cases) {
    this.cases = [...this.cases, ...cases];
    return this;
  }

  withMixin(mixin: Mixin<GlobalState, ModuleState>) {
    Object.assign(this.globalState, mixin.globalState);
    Object.assign(this.moduleState, mixin.moduleState);
    this.cases = [...mixin.mixinCases, ...this.cases];
    return this;
  }

  visit(node: ts.Node) {
    this.switchNode(node);
  }

  case<T extends ts.Node>(
    filter: (node: ts.Node) => node is T,
    method:
      | ((
          node: T,
          context: { globalState: GlobalState; moduleState: ModuleState }
        ) => any)
      | {
          onEnter?: (
            node: T,
            context: { globalState: GlobalState; moduleState: ModuleState }
          ) => any;
          onExit?: (
            node: T,
            context: { globalState: GlobalState; moduleState: ModuleState }
          ) => any;
        }
  ) {
    return [filter, method] as const;
  }

  private switchNode(node: ts.Node) {
    const matches = this.cases.filter(([filter]) => {
      return filter(node);
    });

    const exitMethods: Array<
      (
        node: any,
        context: { globalState: GlobalState; moduleState: ModuleState }
      ) => any
    > = [];

    matches.forEach((match) => {
      if (match && match[1]) {
        const [, method] = match;
        if (typeof method === "function") {
          method(node, this.context);
        } else {
          const { onEnter, onExit } = method;
          if (onEnter) {
            onEnter(node, this.context);
          }
          if (onExit) {
            exitMethods.push(onExit);
          }
        }
      }
    });

    ts.forEachChild(node, (childNode) => this.switchNode(childNode));
    const deferredActions: Array<() => any> = [];
    exitMethods.forEach((method) => {
      const deferredExitAction = method(node, this.context);
      // TODO: document the order of class visitor method execution
      // this deferral method is a sneaky way of allowing the subclass
      // to benefit from exit actions that happen after it, even though
      // they're queued up before subclass visitor cases
      if (typeof deferredExitAction === "function") {
        deferredActions.push(deferredExitAction);
      }
    });
    deferredActions.forEach((action) => action());
  }
}
