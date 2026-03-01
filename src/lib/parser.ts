import MarkdownIt, { Token } from "markdown-it";
import { ReactNode } from "react";
import { ASTNode } from "./types";
import { cleanupTokens } from "./util/cleanupTokens";
import groupTextTokens from "./util/groupTextTokens";
import omitListItemParagraph from "./util/omitListItemParagraph";
import { stringToTokens } from "./util/stringToTokens";
import tokensToAST from "./util/tokensToAST";

export default function parser(
  source: string,
  renderer: (source: ASTNode[]) => ReactNode,
  markdownIt: MarkdownIt,
): ReactNode {
  if (Array.isArray(source)) {
    return renderer(source);
  }

  let tokens: (Token)[] = stringToTokens(source, markdownIt);
  tokens = cleanupTokens(tokens);
  tokens = groupTextTokens(tokens);
  tokens = omitListItemParagraph(tokens);

  const astTree = tokensToAST(tokens);

  return renderer(astTree);
}
