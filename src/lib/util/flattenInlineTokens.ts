import {Token} from "markdown-it";
import TextToken from "./Token";

export default function flattenTokens(
  tokens: (Token | TextToken)[],
): (Token | TextToken)[] {
  return tokens.reduce<(Token | TextToken)[]>((acc, curr) => {
    if (curr.type === "inline" && curr.children && curr.children.length > 0) {
      const children = flattenTokens(curr.children);
      while (children.length) {
        acc.push(children.shift()!);
      }
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);
}
