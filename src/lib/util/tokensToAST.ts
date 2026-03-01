import { Token } from "markdown-it";
import { ASTNode } from "../types";
import getTokenTypeByToken from "./getTokenTypeByToken";
import getUniqueID from "./getUniqueID";

function createNode(token: Token, tokenIndex: number): ASTNode {
  const type = getTokenTypeByToken(token);
  const content = token.content;

  let attributes = {};

  if (token.attrs) {
    attributes = token.attrs.reduce((prev, curr) => {
      const [name, value] = curr;
      return {...prev, [name]: value};
    }, {});
  }

  return {
    type,
    sourceType: token.type,
    sourceInfo: token.info,
    sourceMeta: token.meta as unknown,
    block: token.block,
    markup: token.markup,
    key: getUniqueID() + "_" + type,
    content,
    tokenIndex,
    index: 0,
    attributes,
    children: token.children ? tokensToAST(token.children) : [],
  };
}

export default function tokensToAST(tokens?: (Token)[]): ASTNode[] {
  const stack = [];
  let children: ASTNode[] = [];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const astNode = createNode(token, i);

    if (
      !(
        astNode.type === "text" &&
        astNode.children.length === 0 &&
        astNode.content === ""
      )
    ) {
      astNode.index = children.length;

      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        // @ts-expect-error read-only is not a concern
        children = astNode.children;
      } else if (token.nesting === -1) {
        // @ts-expect-error we know it's defined
        children = stack.pop();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (token.nesting === 0) {
        children.push(astNode);
      }
    }
  }

  return children;
}
