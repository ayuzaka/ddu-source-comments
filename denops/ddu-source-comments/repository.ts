import type { Denops } from "jsr:@denops/core@~7.0.0";
import type { CommentData } from "./types.ts";

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
  // その場合、さらに JSON.parse を適用すると "[object Object]" になり失敗する。
  if (Array.isArray(result)) {
    return result as CommentData[];
  }

  if (typeof result === "string") {
    return JSON.parse(result) as CommentData[];
  }

  // 予期しない型の場合は空配列を返す
  return [];
}
