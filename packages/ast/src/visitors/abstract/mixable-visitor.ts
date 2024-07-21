import { BaseVisitor } from "./base-visitor";

export abstract class MixableVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> extends BaseVisitor<GlobalState, ModuleState> {
  abstract get mixinCases(): (typeof BaseVisitor.prototype)["cases"];
}
