import { AbstractVisitor } from "./abstract-visitor";

export abstract class MixableVisitor<
  GlobalState extends Record<any, any>,
  ModuleState extends Record<any, any>,
> extends AbstractVisitor<GlobalState, ModuleState> {
  abstract get mixinCases(): (typeof AbstractVisitor.prototype)["cases"];
}
