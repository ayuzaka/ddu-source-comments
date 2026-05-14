import type { CommentData, CommentItem } from "./types.ts";

const DISPLAY_WIDTH = 80;

function formatDisplay(relpath: string, linenumber: number, comment: string): string {
  const firstLine = comment.split("\n")[0];
  const prefix = `${relpath}:${linenumber} │ `;
  const maxCommentLength = DISPLAY_WIDTH - prefix.length - 3; // 3 for "..."

  if (firstLine.length > maxCommentLength && maxCommentLength > 0) {
    return prefix + firstLine.slice(0, maxCommentLength) + "...";
  }

  return prefix + firstLine;
}

export function formatItems(
  comments: CommentData[],
  toplevel: string,
): CommentItem[] {
  return comments.map((comment) => ({
    word: `${comment.relpath}:${comment.linenumber} │ ${comment.comment}`,
    display: formatDisplay(comment.relpath, comment.linenumber, comment.comment),
    action: {
      path: `${toplevel}/${comment.relpath}`,
      lineNr: comment.linenumber,
      col: 1,
      toplevel,
      relpath: comment.relpath,
      comment: comment.comment,
    },
  }));
}
