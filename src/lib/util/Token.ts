import { Token } from "markdown-it";

export default class TextToken {
  constructor(
    public type: "textgroup",
    public nesting: number
  ) {}

  public get children(): Token[] {
    return [];
  }

  public get tag(): "" {
    return "";
  }

  public get content(): "" {
    return "";
  }

  public get attrs(): null {
    return null;
  }
  public get info(): undefined {
    return undefined;
  }
  public get meta(): undefined {
    return undefined;
  }
  public get markup(): undefined {
    return undefined;
  }

  public block: boolean = false;
}
