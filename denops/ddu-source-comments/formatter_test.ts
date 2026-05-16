import { assertEquals } from "jsr:@std/assert@1";
import { formatItems } from "./formatter.ts";
import type { CommentData } from "./types.ts";

Deno.test("givenSingleComment_whenFormatted_returnsItemWithCorrectPath", () => {
  // Arrange
  const comments: CommentData[] = [
    { relpath: "src/main.ts", linenumber: 42, comment: "TODO: refactor" },
  ];
  const toplevel = "/home/user/project";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  assertEquals(items.length, 1);
  assertEquals(items[0].action?.path, "/home/user/project/src/main.ts");
  assertEquals(items[0].action?.lineNr, 42);
  assertEquals(items[0].action?.col, 1);
});

Deno.test("givenMultilineComment_whenFormatted_displayShowsOnlyFirstLine", () => {
  // Arrange
  const comments: CommentData[] = [
    {
      relpath: "src/main.ts",
      linenumber: 10,
      comment: "First line\nSecond line\nThird line",
    },
  ];
  const toplevel = "/proj";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  assertEquals(
    items[0].display,
    "src/main.ts:10 │ First line",
  );
});

Deno.test("givenLongFirstLine_whenFormatted_displayTruncatesTo80CharsWithEllipsis", () => {
  // Arrange
  const longLine = "a".repeat(100);
  const comments: CommentData[] = [
    {
      relpath: "src/main.ts",
      linenumber: 5,
      comment: longLine,
    },
  ];
  const toplevel = "/proj";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  const prefix = "src/main.ts:5 │ ";
  const expectedDisplay = prefix + "a".repeat(80 - prefix.length - 3) + "...";
  assertEquals(items[0].display, expectedDisplay);
});

Deno.test("givenMultipleComments_whenFormatted_returnsItemsInOrder", () => {
  // Arrange
  const comments: CommentData[] = [
    { relpath: "a.ts", linenumber: 1, comment: "First" },
    { relpath: "b.ts", linenumber: 2, comment: "Second" },
  ];
  const toplevel = "/proj";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  assertEquals(items.length, 2);
  assertEquals(items[0].action?.relpath, "a.ts");
  assertEquals(items[1].action?.relpath, "b.ts");
});

Deno.test("givenEmptyComments_whenFormatted_returnsEmptyArray", () => {
  // Arrange
  const comments: CommentData[] = [];
  const toplevel = "/proj";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  assertEquals(items.length, 0);
});

Deno.test("givenMultilineComment_whenFormatted_wordContainsFullComment", () => {
  // Arrange
  const fullComment = "Line1\nLine2\nLine3";
  const comments: CommentData[] = [
    { relpath: "src/main.ts", linenumber: 10, comment: fullComment },
  ];
  const toplevel = "/proj";

  // Act
  const items = formatItems(comments, toplevel);

  // Assert
  assertEquals(items[0].word, "src/main.ts:10 │ " + fullComment);
});
