import type { CommentData, CommentItem } from "./types.ts";

const ELLIPSIS = "...";

function charWidth(char: string): number {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) {
    return 0;
  }

  if (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf &&
        codePoint !== 0x303f) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6))
  ) {
    return 2;
  }

  return 1;
}

function displayWidth(text: string): number {
  return Array.from(text).reduce((width, char) => width + charWidth(char), 0);
}

function truncateToWidth(text: string, maxWidth: number): string {
  let width = 0;
  let truncated = "";

  for (const char of text) {
    const nextWidth = width + charWidth(char);
    if (nextWidth > maxWidth) {
      break;
    }

    width = nextWidth;
    truncated += char;
  }

  return truncated;
}

function formatDisplay(
  relpath: string,
  linenumber: number,
  comment: string,
  maxDisplayWidth?: number,
): string {
  const firstLine = comment.split("\n")[0];
  const prefix = `${relpath}:${linenumber} │ `;
  const display = prefix + firstLine;

  if (
    maxDisplayWidth === undefined || displayWidth(display) <= maxDisplayWidth
  ) {
    return display;
  }

  const maxCommentWidth = maxDisplayWidth - displayWidth(prefix) -
    displayWidth(ELLIPSIS);
  if (maxCommentWidth <= 0) {
    return truncateToWidth(prefix, maxDisplayWidth);
  }

  return prefix + truncateToWidth(firstLine, maxCommentWidth) + ELLIPSIS;
}

export function formatItems(
  comments: CommentData[],
  toplevel: string,
  maxDisplayWidth?: number,
): CommentItem[] {
  return comments.map((comment) => ({
    word: `${comment.relpath}:${comment.linenumber} │ ${comment.comment}`,
    display: formatDisplay(
      comment.relpath,
      comment.linenumber,
      comment.comment,
      maxDisplayWidth,
    ),
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
