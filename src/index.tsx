import MarkdownIt from "markdown-it";
import type {ReactNode} from "react";
import React, {useMemo} from "react";
import type {TextStyle, ViewStyle} from "react-native";
import {StyleSheet, Text} from "react-native";

import AstRenderer from "./lib/AstRenderer";
import parser from "./lib/parser";
import type {RenderRules} from "./lib/renderRules";
import renderRules from "./lib/renderRules";
import {styles} from "./lib/styles";
import type {ASTNode} from "./lib/types";
import removeTextStyleProps from "./lib/util/removeTextStyleProps";

function getStyle<T>(
  mergeStyle: boolean,
  style: StyleSheet.NamedStyles<T> | undefined,
): ReturnType<typeof StyleSheet.create> {
  let useStyles: Record<string, ViewStyle | TextStyle> = {};

  if (mergeStyle && style != null) {
    Object.keys(style).forEach((value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useStyles[value] = {
        // @ts-expect-error this is fine
        ...StyleSheet.flatten(style[value]),
      };
    });

    Object.keys(styles).forEach((value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useStyles[value] = {
        // @ts-expect-error this is fine
        ...styles[value],
        // @ts-expect-error this is fine
        ...StyleSheet.flatten(style[value]),
      };
    });
  } else {
    // @ts-expect-error this is fine
    useStyles = {
      ...styles,
    };

    if (style != null) {
      Object.keys(style).forEach((value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        useStyles[value] = {
          // @ts-expect-error this is fine
          ...StyleSheet.flatten(style[value]),
        };
      });
    }
  }

  Object.keys(useStyles).forEach((value) => {
    useStyles[`_VIEW_SAFE_${value}`] = removeTextStyleProps(useStyles[value]);
  });

  return StyleSheet.create(useStyles);
}

const getRenderer = (
  renderer: AstRenderer | undefined,
  rules: RenderRules | undefined,
  style: StyleSheet.NamedStyles<unknown> | undefined,
  mergeStyle: boolean,
  onLinkPress: ((url: string) => boolean) | undefined,
  maxTopLevelChildren: number | null,
  topLevelMaxExceededItem: React.ReactNode,
  allowedImageHandlers: string[],
  defaultImageHandler: string,
  debugPrintTree: boolean,
): AstRenderer => {
  if (renderer && rules) {
    console.warn(
      "react-native-markdown-display you are using renderer and rules at the same time. This is not possible, props.rules is ignored",
    );
  }

  if (renderer && style) {
    console.warn(
      "react-native-markdown-display you are using renderer and style at the same time. This is not possible, props.style is ignored",
    );
  }

  if (renderer) {
    if (
      !(typeof renderer === "function") ||
      (renderer as unknown) instanceof AstRenderer
    ) {
      return renderer;
    } else {
      throw new TypeError(
        "Provided renderer is not compatible with function or AstRenderer. please change",
      );
    }
  } else {
    const useStyles = getStyle(mergeStyle, style);

    return new AstRenderer(
      {
        ...renderRules,
        ...(rules ?? {}),
      },
      useStyles,
      onLinkPress,
      maxTopLevelChildren,
      topLevelMaxExceededItem,
      allowedImageHandlers,
      defaultImageHandler,
      debugPrintTree,
    );
  }
};

export interface MarkdownProps {
  children: string;
  rules?: RenderRules;
  style?: StyleSheet.NamedStyles<unknown>;
  renderer?: AstRenderer;
  markdownit?: MarkdownIt;
  mergeStyle?: boolean;
  debugPrintTree?: boolean;
  onLinkPress?: (url: string) => boolean;
}

const Markdown: React.FC<
  MarkdownProps & {
    maxTopLevelChildren: number | null;
    topLevelMaxExceededItem: React.ReactNode;
    allowedImageHandlers: string[];
    defaultImageHandler: string;
  }
> = React.memo(
  ({
    children,
    renderer = undefined,
    rules = undefined,
    style = undefined,
    mergeStyle = true,
    markdownit = MarkdownIt({
      typographer: true,
    }),
    onLinkPress,
    maxTopLevelChildren = null,
    topLevelMaxExceededItem = <Text key="dotdotdot">...</Text>,
    allowedImageHandlers = [
      "data:image/png;base64",
      "data:image/gif;base64",
      "data:image/jpeg;base64",
      "https://",
      "http://",
    ],
    defaultImageHandler = "https://",
    debugPrintTree = false,
  }: MarkdownProps & {
    maxTopLevelChildren: number | null;
    topLevelMaxExceededItem: React.ReactNode;
    allowedImageHandlers: string[];
    defaultImageHandler: string;
  }) => {
    const momoizedRenderer = useMemo(
      () =>
        getRenderer(
          renderer,
          rules,
          style,
          mergeStyle,
          onLinkPress,
          maxTopLevelChildren,
          topLevelMaxExceededItem,
          allowedImageHandlers,
          defaultImageHandler,
          debugPrintTree,
        ),
      [
        maxTopLevelChildren,
        onLinkPress,
        renderer,
        rules,
        style,
        mergeStyle,
        topLevelMaxExceededItem,
        allowedImageHandlers,
        defaultImageHandler,
        debugPrintTree,
      ],
    );

    const memoizedParser = useMemo(() => markdownit, [markdownit]);

    return parser(
      children,
      (nodes: readonly ASTNode[]): ReactNode => momoizedRenderer.render(nodes),
      memoizedParser,
    );
  },
);

export default Markdown;

export {default as MarkdownIt} from "markdown-it";
export {default as AstRenderer} from "./lib/AstRenderer";
export {default as textStyleProps} from "./lib/data/textStyleProps";
export {default as parser} from "./lib/parser";
export {default as renderRules} from "./lib/renderRules";
export {styles} from "./lib/styles";
export {default as getUniqueID} from "./lib/util/getUniqueID";
export {default as hasParents} from "./lib/util/hasParents";
export {default as openUrl} from "./lib/util/openUrl";
export {default as removeTextStyleProps} from "./lib/util/removeTextStyleProps";
export {stringToTokens} from "./lib/util/stringToTokens";
export {default as tokensToAST} from "./lib/util/tokensToAST";
