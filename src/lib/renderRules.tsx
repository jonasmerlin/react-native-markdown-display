import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import textStyleProps from "./data/textStyleProps";
import type { ASTNode } from "./types";
import hasParents from "./util/hasParents";
import openUrl from "./util/openUrl";

export type RenderFunction = (
  node: ASTNode,
  children: ReactNode[],
  parentNodes: ASTNode[],
  styles: Record<string, ViewStyle>
) => ReactNode;

export type InheritingRenderFunction = (
  node: ASTNode,
  children: ReactNode[],
  parentNodes: ASTNode[],
  styles: Record<string, ViewStyle>,
  inheritedStyles?: Record<string, ViewStyle>
) => ReactNode;

export type RenderLinkFunction = (
  node: ASTNode,
  children: ReactNode[],
  parentNodes: ASTNode[],
  styles: Record<string, ViewStyle>,
  onLinkPress?: (url: string) => boolean
) => ReactNode;

export type RenderImageFunction = (
  node: ASTNode,
  children: ReactNode[],
  parentNodes: ASTNode[],
  styles: Record<string, ViewStyle>,
  allowedImageHandlers: string[],
  defaultImageHandler: string | null
) => ReactNode;

export type SomeRenderFunction =
  | RenderFunction
  | InheritingRenderFunction
  | RenderLinkFunction
  | RenderImageFunction;

export interface RenderRules {
  unknown: RenderFunction;
  body: RenderFunction;
  heading1: RenderFunction;
  heading2: RenderFunction;
  heading3: RenderFunction;
  heading4: RenderFunction;
  heading5: RenderFunction;
  heading6: RenderFunction;
  hr: RenderFunction;
  strong: RenderFunction;
  em: RenderFunction;
  s: RenderFunction;
  blockquote: RenderFunction;
  bullet_list: RenderFunction;
  ordered_list: RenderFunction;
  list_item: InheritingRenderFunction;
  code_inline: InheritingRenderFunction;
  code_block: InheritingRenderFunction;
  fence: InheritingRenderFunction;
  table: RenderFunction;
  thead: RenderFunction;
  tbody: RenderFunction;
  th: RenderFunction;
  tr: RenderFunction;
  td: RenderFunction;
  link: RenderLinkFunction;
  blocklink: RenderLinkFunction;
  image: RenderImageFunction;
  text: InheritingRenderFunction;
  textgroup: RenderFunction;
  paragraph: RenderFunction;
  hardbreak: RenderFunction;
  softbreak: RenderFunction;
  pre: RenderFunction;
  inline: RenderFunction;
  span: RenderFunction;
}

const renderRules: RenderRules = {
  // when unknown elements are introduced, so it wont break
  unknown: () => null,

  // The main container
  body: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_body}>
      {children}
    </View>
  ),

  // Headings
  heading1: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading1}>
      {children}
    </View>
  ),
  heading2: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading2}>
      {children}
    </View>
  ),
  heading3: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading3}>
      {children}
    </View>
  ),
  heading4: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading4}>
      {children}
    </View>
  ),
  heading5: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading5}>
      {children}
    </View>
  ),
  heading6: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_heading6}>
      {children}
    </View>
  ),

  // Horizontal Rule
  hr: (node, _children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_hr} />
  ),

  // Emphasis
  strong: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.strong}>
      {children}
    </Text>
  ),
  em: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.em}>
      {children}
    </Text>
  ),
  s: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.s}>
      {children}
    </Text>
  ),

  // Blockquotes
  blockquote: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_blockquote}>
      {children}
    </View>
  ),

  // Lists
  bullet_list: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_bullet_list}>
      {children}
    </View>
  ),
  ordered_list: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_ordered_list}>
      {children}
    </View>
  ),
  // this is a unique and quite annoying render rule because it has
  // child items that can be styled (the list icon and the list content)
  // outside of the AST tree so there are some work arounds in the
  // AST renderer specifically to get the styling right here
  list_item: (node, children, parent, styles, inheritedStyles = {}) => {
    // we need to grab any text specific stuff here that is applied on the list_item style
    // and apply it onto bullet_list_icon. the AST renderer has some workaround code to make
    // the content classes apply correctly to the child AST tree items as well
    // as code that forces the creation of the inheritedStyles object for list_items
    const refStyle = {
      ...inheritedStyles,
      ...StyleSheet.flatten(styles.list_item),
    };

    const arr = Object.keys(refStyle);

    const modifiedInheritedStylesObj: Record<string, ViewStyle> = {};

    for (let b = 0; b < arr.length; b++) {
      if (textStyleProps.includes(arr[b])) {
        // @ts-expect-error - this is fine
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        modifiedInheritedStylesObj[arr[b]] = refStyle[arr[b]];
      }
    }

    if (hasParents(parent, "bullet_list")) {
      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text
            style={[modifiedInheritedStylesObj, styles.bullet_list_icon]}
            accessible={false}
          >
            {Platform.select({
              android: "\u2022",
              ios: "\u00B7",
              default: "\u2022",
            })}
          </Text>
          <View style={styles._VIEW_SAFE_bullet_list_content}>{children}</View>
        </View>
      );
    }

    if (hasParents(parent, "ordered_list")) {
      const orderedListIndex = parent.findIndex(
        (el) => el.type === "ordered_list"
      );

      const orderedList = parent[orderedListIndex];
      let listItemNumber;

      // @ts-expect-error - this is fine
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-const
      listItemNumber = orderedList.attributes.start
        ? // @ts-expect-error - this is fine
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          orderedList.attributes.start + node.index
        : (node.index ?? 0) + 1;

      return (
        <View key={node.key} style={styles._VIEW_SAFE_list_item}>
          <Text style={[modifiedInheritedStylesObj, styles.ordered_list_icon]}>
            {listItemNumber}
            {node.markup}
          </Text>
          <View style={styles._VIEW_SAFE_ordered_list_content}>{children}</View>
        </View>
      );
    }

    // we should not need this, but just in case
    return (
      <View key={node.key} style={styles._VIEW_SAFE_list_item}>
        {children}
      </View>
    );
  },

  // Code
  code_inline: (node, _children, _parent, styles, inheritedStyles = {}) => (
    <Text key={node.key} style={[inheritedStyles, styles.code_inline]}>
      {node.content}
    </Text>
  ),
  code_block: (
    { content, key },
    _children,
    _parent,
    styles,
    inheritedStyles = {}
  ) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.

    if (typeof content === "string" && content.endsWith("\n")) {
      content = content.substring(0, content.length - 1);
    }

    return (
      <Text key={key} style={[inheritedStyles, styles.code_block]}>
        {content}
      </Text>
    );
  },
  fence: (
    { content, key },
    _children,
    _parent,
    styles,
    inheritedStyles = {}
  ) => {
    // we trim new lines off the end of code blocks because the parser sends an extra one.

    if (typeof content === "string" && content.endsWith("\n")) {
      content = content.substring(0, content.length - 1);
    }

    return (
      <Text key={key} style={[inheritedStyles, styles.fence]}>
        {content}
      </Text>
    );
  },

  // Tables
  table: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_table}>
      {children}
    </View>
  ),
  thead: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_thead}>
      {children}
    </View>
  ),
  tbody: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_tbody}>
      {children}
    </View>
  ),
  th: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_th}>
      {children}
    </View>
  ),
  tr: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_tr}>
      {children}
    </View>
  ),
  td: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_td}>
      {children}
    </View>
  ),

  // Links
  link: (node, children, _parent, styles, onLinkPress) => (
    <Text
      key={node.key}
      style={styles.link}
      onPress={
        node.attributes && (() => openUrl(node.attributes?.href, onLinkPress))
      }
    >
      {children}
    </Text>
  ),
  blocklink: (node, children, _parent, styles, onLinkPress) => (
    <TouchableWithoutFeedback
      key={node.key}
      onPress={
        node.attributes && (() => openUrl(node.attributes?.href, onLinkPress))
      }
      style={styles.blocklink}
    >
      <View style={styles.image}>{children}</View>
    </TouchableWithoutFeedback>
  ),

  // Images
  image: (
    node,
    _children,
    _parent,
    styles,
    allowedImageHandlers,
    defaultImageHandler
  ) => {
    if (!node.attributes) {
      return null;
    }

    const { src, alt } = node.attributes;

    if (typeof src !== "string") {
      return null;
    }

    // we check that the source starts with at least one of the elements in allowedImageHandlers
    const show = allowedImageHandlers.some((value) => {
      return src.toLowerCase().startsWith(value.toLowerCase());
    });

    if (!show && defaultImageHandler === null) {
      return null;
    }

    const imageProps = {
      indicator: true,
      key: node.key,
      style: styles._VIEW_SAFE_image,
      source: {
        uri: show ? src : `${defaultImageHandler}${src}`,
      },
    };

    if (alt) {
      // @ts-expect-error - this is fine
      imageProps.accessible = true;
      // @ts-expect-error - this is fine
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      imageProps.accessibilityLabel = alt;
    }

    if (imageProps.style.overflow === "scroll") {
      throw new Error(
        "Image style property 'overflow' is set to 'scroll'. This is not supported"
      );
    }
    // @ts-expect-error - this is fine
    return <FitImage {...imageProps} />;
  },

  // Text Output
  text: (node, _children, _parent, styles, inheritedStyles = {}) => (
    <Text key={node.key} style={[inheritedStyles, styles.text]}>
      {node.content}
    </Text>
  ),
  textgroup: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.textgroup}>
      {children}
    </Text>
  ),
  paragraph: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_paragraph}>
      {children}
    </View>
  ),
  hardbreak: (node, _children, _parent, styles) => (
    <Text key={node.key} style={styles.hardbreak}>
      {"\n"}
    </Text>
  ),
  softbreak: (node, _children, _parent, styles) => (
    <Text key={node.key} style={styles.softbreak}>
      {"\n"}
    </Text>
  ),

  // Believe these are never used but retained for completeness
  pre: (node, children, _parent, styles) => (
    <View key={node.key} style={styles._VIEW_SAFE_pre}>
      {children}
    </View>
  ),
  inline: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.inline}>
      {children}
    </Text>
  ),
  span: (node, children, _parent, styles) => (
    <Text key={node.key} style={styles.span}>
      {children}
    </Text>
  ),
};

export default renderRules;
