import MarkdownIt, { type Token } from "markdown-it";

const {core: {State: {prototype: {Token}}}} = new MarkdownIt();

export default function groupTextTokens(
  tokens: Token[],
): (Token)[] {
  const result: Token[] = [];

  let hasGroup = false;

  tokens.forEach((token) => {
    if (!token.block && !hasGroup) {
      hasGroup = true;
      result.push(new Token("textgroup", "", 1));
      result.push(token);
    } else if (!token.block && hasGroup) {
      result.push(token);
    } else if (token.block && hasGroup) {
      hasGroup = false;
      result.push(new Token("textgroup", "", -1));
      result.push(token);
    } else {
      result.push(token);
    }
  });

  return result;
}
