import { Token } from "markdown-it";
import { RenderRules } from "../renderRules";
import TextToken from "./Token";

const regSelectOpenClose = /_open|_close/g;

/**
 *
 * @example {
    "type": "heading_open",
    "tag": "h1",
    "attrs": null,
    "map": [
      1,
      2
    ],
    "nesting": 1,
    "level": 0,
    "children": null,
    "content": "",
    "markup": "#",
    "info": "",
    "meta": null,
    "block": true,
    "hidden": false
  }
 * @param token
 * @return {String}
 */
export default function getTokenTypeByToken(
  token: Token | TextToken
): keyof RenderRules {
  let cleanedType: keyof RenderRules | "heading" = "unknown";

  if (token.type) {
    cleanedType = token.type.replace(regSelectOpenClose, "") as
      | keyof RenderRules
      | "heading";
  }

  switch (cleanedType) {
    case "heading": {
      return `${cleanedType}${token.tag.substring(1) as "1" | "2" | "3" | "4" | "5" | "6"}`;
    }
    default: {
      return cleanedType;
    }
  }
}
