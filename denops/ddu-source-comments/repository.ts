import type { Denops } from "jsr:@denops/core@~7.0.0";
import type { CommentData } from "./types.ts";

/**
 * config.comments_core.read_all() の実際の返り値形式:
 * { [toplevel: string]: { [relpath: string]: { [linenumber: string]: string } } }
 * を CommentData[] に変換する。
 */
function parseNestedComments(
  result: Record<string, unknown>,
  toplevel: string,
): CommentData[] {
  let commentsMap: Record<string, Record<string, string>> | undefined;

  // 形式A: { [toplevel]: { [relpath]: { [line]: comment } } }
  if (toplevel in result) {
    const value = result[toplevel];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      commentsMap = value as Record<string, Record<string, string>>;
    }
  } else if (Object.keys(result).length > 0) {
    // 形式B: toplevel キーなしで直接 { [relpath]: { [line]: comment } }
    // 値がオブジェクトであることを確認
    const firstKey = Object.keys(result)[0];
    const firstValue = result[firstKey];
    if (
      firstValue &&
      typeof firstValue === "object" &&
      !Array.isArray(firstValue)
    ) {
      commentsMap = result as Record<string, Record<string, string>>;
    }
  }

  if (!commentsMap) return [];

  const comments: CommentData[] = [];
  for (const [relpath, lines] of Object.entries(commentsMap)) {
    if (!lines || typeof lines !== "object" || Array.isArray(lines)) continue;
    for (const [linenumberStr, comment] of Object.entries(lines)) {
      if (typeof comment !== "string") continue;
      comments.push({
        relpath,
        linenumber: Number(linenumberStr),
        comment,
      });
    }
  }
  return comments;
}

export async function readAll(
  denops: Denops,
  toplevel: string,
): Promise<CommentData[]> {
  const result = await denops.call(
    "luaeval",
    "require('config.comments_core').read_all(_A)",
    toplevel,
  );

  // denops.call("luaeval", ...) は Lua のテーブルを自動的に
  // JavaScript のオブジェクトに変換して返すことがある。
  // 実際の返り値形式: { [toplevel]: { [relpath]: { [linenumber]: comment } } }
  if (result && typeof result === "object" && !Array.isArray(result)) {
    return parseNestedComments(result as Record<string, unknown>, toplevel);
  }

  // フォールバック: 配列を直接返す場合
  if (Array.isArray(result)) {
    return result as CommentData[];
  }

  // フォールバック: JSON 文字列を返す場合
  if (typeof result === "string") {
    return JSON.parse(result) as CommentData[];
  }

  return [];
}
