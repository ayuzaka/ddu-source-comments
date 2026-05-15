import { BaseSource } from "@shougo/ddu-vim/source";
import type { GatherArguments } from "@shougo/ddu-vim/source";
import type { Item } from "@shougo/ddu-vim/types";
import type { ActionData } from "../ddu-source-comments/types.ts";
import { readAll } from "../ddu-source-comments/repository.ts";
import { formatItems } from "../ddu-source-comments/formatter.ts";

type Params = Record<string, never>;

export class Source extends BaseSource<Params, ActionData> {
  override kind = "comments";

  override gather(
    args: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const cwd = args.context.cwd;
        let toplevel = "";

        try {
          const result = await args.denops.call(
            "systemlist",
            `git -C ${cwd} rev-parse --show-toplevel`,
          ) as string[];
          toplevel = result[0]?.trim() ?? "";
        } catch {
          // Not a git repository
        }

        if (!toplevel) {
          controller.enqueue([]);
          controller.close();
          return;
        }

        try {
          const comments = await readAll(args.denops, toplevel);
          const items = formatItems(comments, toplevel);
          controller.enqueue(items);
        } catch (error) {
          console.warn(
            "[ddu-source-comments] Failed to read comments:",
            error,
          );
          controller.enqueue([]);
        }

        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}
