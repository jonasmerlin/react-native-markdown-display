import MarkdownIt, { Token } from "markdown-it";

export function stringToTokens(
  source: string,
  markdownIt: MarkdownIt
): Token[] {
  let result: Token[] = [];
  try {
    result = markdownIt.parse(source, {});
  } catch (err) {
    console.warn(err);
  }

  return result;
}
