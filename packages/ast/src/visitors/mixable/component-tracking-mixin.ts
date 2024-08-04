import {
  isBlock,
  isFunctionDeclaration,
  isVariableDeclaration,
} from "typescript";

import { MixableVisitor } from "../abstract/mixable-visitor";
import {
  functionDeclarationIsPossibleComponent,
  getBlockPosition,
  getFunctionDeclarationName,
  getVarDeclarationName,
  varDeclarationIsPossibleFunctionComponent,
} from "../utils/component";

interface ComponentAwareState extends Record<any, any> {
  current: string | undefined;
  position: readonly [number, number] | undefined;
}

/**
 * principles: state separation but easy access to mixin state
 *
 * mixins do not affect global state, it's up to the visitor objects to decide what state is global
 */

export class ComponentTrackingMixin extends MixableVisitor<any, any> {
  private state: ComponentAwareState = {
    current: undefined,
    position: undefined,
  };

  get current() {
    return this.state.current;
  }

  get position() {
    return this.state.position;
  }

  get mixinCases() {
    return [
      this.case(isVariableDeclaration, (node) => {
        if (varDeclarationIsPossibleFunctionComponent(node)) {
          const position = getBlockPosition(node);
          if (
            this.state.current &&
            this.state.position &&
            position[0] > this.state.position[0] &&
            position[0] < this.state.position[1]
          ) {
            // do not overwrite current component if we are inside one
            return;
          }
          this.state.current = getVarDeclarationName(node);
          this.state.position = position;
        }
      }),

      this.case(isFunctionDeclaration, (node) => {
        if (functionDeclarationIsPossibleComponent(node)) {
          const position = getBlockPosition(node);
          if (
            this.state.current &&
            this.state.position &&
            position[0] > this.state.position[0] &&
            position[0] < this.state.position[1]
          ) {
            // do not overwrite current component if we are inside one
            return;
          }
          this.state.current = getFunctionDeclarationName(node);
          this.state.position = position;
        }
      }),

      this.case(isBlock, {
        onExit: (node) => {
          if (
            this.state.current !== undefined &&
            node.pos === this.state.position?.[0]
          ) {
            // run our cleanup after subclassed exit logic for blocks
            return () => {
              this.state.current = undefined;
              this.state.position = undefined;
            };
          }
        },
      }),
    ];
  }
}
