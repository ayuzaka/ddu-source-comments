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
  return JSON.parse(result as string) as CommentData[];
}
