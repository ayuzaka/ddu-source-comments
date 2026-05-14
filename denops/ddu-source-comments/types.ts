import type { Item } from "@shougo/ddu-vim/types";

/**
 * Raw comment data returned from the Lua core.
 */
export interface CommentData {
  relpath: string;
  linenumber: number;
  comment: string;
}

/**
 * ActionData attached to each ddu Item.
 * Used by ddu-kind-file for `open` and by our custom `delete` action.
 */
export interface ActionData {
  path: string;
  lineNr: number;
  col: number;
  toplevel: string;
  relpath: string;
  comment: string;
}

/**
 * A ddu Item specialized for the comments source.
 */
export type CommentItem = Item<ActionData>;
