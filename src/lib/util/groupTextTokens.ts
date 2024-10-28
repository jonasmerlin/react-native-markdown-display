import { Token } from "markdown-it";
import TextToken from "./Token";

export default function groupTextTokens(
  tokens: (Token | TextToken)[]
): (Token | TextToken)[] {
  const result: (Token | TextToken)[] = [];

  let hasGroup = false;

  tokens.forEach((token) => {
    if (!token.block && !hasGroup) {
      hasGroup = true;
      result.push(new TextToken("textgroup", 1));
      result.push(token);
    } else if (!token.block && hasGroup) {
      result.push(token);
    } else if (token.block && hasGroup) {
      hasGroup = false;
      result.push(new TextToken("textgroup", -1));
      result.push(token);
    } else {
      result.push(token);
    }
  });

  return result;
}
