import tokensToAST from "./util/tokensToAST";
import { stringToTokens } from "./util/stringToTokens";
import { cleanupTokens } from "./util/cleanupTokens";
import groupTextTokens from "./util/groupTextTokens";
import omitListItemParagraph from "./util/omitListItemParagraph";
import { ReactNode } from "react";
import MarkdownIt, { Token } from "markdown-it";
import TextToken from "./util/Token";
import { ASTNode } from "./types";

export default function parser(
  source: string,
  renderer: (source: ASTNode[]) => ReactNode,
  markdownIt: MarkdownIt
): ReactNode {
  if (Array.isArray(source)) {
    return renderer(source);
  }

  let tokens: (Token | TextToken)[] = stringToTokens(source, markdownIt);
  tokens = cleanupTokens(tokens);
  tokens = groupTextTokens(tokens);
  tokens = omitListItemParagraph(tokens);

  const astTree = tokensToAST(tokens);

  return renderer(astTree);
}
