import { Token } from "markdown-it";

export default function flattenTokens(
  tokens: (Token)[],
): (Token )[] {
  return tokens.reduce<Token[]>((acc, curr) => {
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
