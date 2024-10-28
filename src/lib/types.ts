import type { RenderRules } from "./renderRules";

export interface ASTNode<T extends keyof RenderRules = keyof RenderRules> {
  type: T;
  sourceType?: string; // original source token name
  sourceInfo?: string;
  sourceMeta?: string;
  block?: boolean;
  key: string;
  content?: string;
  markup?: string;
  tokenIndex?: number;
  index?: number;
  attributes?: Record<string, any>;
  children: ReadonlyArray<ASTNode>;
}
