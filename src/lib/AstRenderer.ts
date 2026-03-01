import {StyleSheet, ViewStyle} from "react-native";

import convertAdditionalStyles from "./util/convertAdditionalStyles";
import getUniqueID from "./util/getUniqueID";

import {ReactNode} from "react";
import textStyleProps from "./data/textStyleProps";
import {RenderRules} from "./renderRules";
import {ASTNode} from "./types";

export default class AstRenderer {
  constructor(
    private renderRules: RenderRules,
    private style: Record<string, ViewStyle>,
    private onLinkPress: ((url: string) => boolean) | undefined,
    private maxTopLevelChildren: number | null,
    private topLevelMaxExceededItem: React.ReactNode,
    private allowedImageHandlers: string[],
    private defaultImageHandler: string,
    private debugPrintTree: boolean,
  ) {}

  getRenderFunction<R extends keyof RenderRules>(type: R): RenderRules[R] {
    const renderFunction = this.renderRules[type];

    if (!renderFunction as unknown) {
      console.warn(
        `Warning, unknown render rule encountered: ${type}. 'unknown' render rule used (by default, returns null - nothing rendered)`,
      );
      return this.renderRules.unknown;
    }

    return renderFunction;
  }

  renderNode(node: ASTNode, parentNodes: ASTNode[], isRoot = false): ReactNode {
    const parents = [...parentNodes];

    if (this.debugPrintTree) {
      let str = "";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of parents) {
        str = str + "-";
      }

      console.log(`${str}${node.type}`);
    }

    parents.unshift(node);

    // calculate the children first
    let children = node.children.map((value) => {
      return this.renderNode(value, parents);
    });

    // render any special types of nodes that have different renderRule function signatures

    if (node.type === "link" || node.type === "blocklink") {
      return this.getRenderFunction(node.type)(
        node,
        children,
        parentNodes,
        this.style,
        this.onLinkPress,
      );
    }

    if (node.type === "image") {
      return this.getRenderFunction(node.type)(
        node,
        children,
        parentNodes,
        this.style,
        this.allowedImageHandlers,
        this.defaultImageHandler,
      );
    }

    // We are at the bottom of some tree - grab all the parent styles
    // this effectively grabs the styles from parents and
    // applies them in order of priority parent (least) to child (most)
    // to allow styling global, then lower down things individually

    // we have to handle list_item seperately here because they have some child
    // pseudo classes that need the additional style props from parents passed down to them
    if (children.length === 0 || node.type === "list_item") {
      const styleObj = {};

      for (let a = parentNodes.length - 1; a > -1; a--) {
        // grab and additional attributes specified by markdown-it
        let refStyle = {};

        if (
          parentNodes[a].attributes?.style &&
          typeof parentNodes[a].attributes?.style === "string"
        ) {
          refStyle = convertAdditionalStyles(
            String(parentNodes[a].attributes?.style),
          );
        }

        // combine in specific styles for the object
        if (this.style[parentNodes[a].type] as unknown) {
          refStyle = {
            ...refStyle,
            ...StyleSheet.flatten(this.style[parentNodes[a].type]),
          };

          // workaround for list_items and their content cascading down the tree
          if (parentNodes[a].type === "list_item") {
            let contentStyle = {};

            if (parentNodes[a + 1].type === "bullet_list") {
              contentStyle = this.style.bullet_list_content;
            } else if (parentNodes[a + 1].type === "ordered_list") {
              contentStyle = this.style.ordered_list_content;
            }

            refStyle = {
              ...refStyle,
              ...StyleSheet.flatten(contentStyle),
            };
          }
        }

        // then work out if any of them are text styles that should be used in the end.
        const arr = Object.keys(refStyle) as (keyof ViewStyle)[];

        for (const key of arr) {
          if (textStyleProps.includes(key)) {
            // @ts-expect-error this is fine
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            styleObj[key] = refStyle[key];
          }
        }
      }

      return this.getRenderFunction(node.type)(
        node,
        children,
        parentNodes,
        this.style,
        styleObj,
      );
    }

    // cull top level children

    if (
      isRoot &&
      this.maxTopLevelChildren &&
      children.length > this.maxTopLevelChildren
    ) {
      children = children.slice(0, this.maxTopLevelChildren);
      children.push(this.topLevelMaxExceededItem);
    }

    // render anythign else that has a normal signature

    return this.getRenderFunction(node.type)(
      node,
      children,
      parentNodes,
      this.style,
    );
  }

  render(nodes: readonly ASTNode[]): ReactNode {
    const root: ASTNode = {type: "body", key: getUniqueID(), children: nodes};
    return this.renderNode(root, [], true);
  }
}
