import { ASTNode } from "../types";

export default function hasParents(parents: ASTNode[], type: string): boolean {
  return parents.findIndex((el) => el.type === type) > -1;
}
