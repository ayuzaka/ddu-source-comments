import { BaseKind } from "jsr:@shougo/ddu-vim@~11.1.0/kind";
import type { ActionArguments } from "jsr:@shougo/ddu-vim@~11.1.0/types";
import { ActionFlags } from "jsr:@shougo/ddu-vim@~11.1.0/types";
import type { ActionData } from "../ddu-source-comments/types.ts";

type Params = Record<string, never>;

export class Kind extends BaseKind<Params> {
  override actions = {
    delete: {
      description: "Delete the selected comment(s)",
      callback: async (args: ActionArguments<Params>) => {
        const count = args.items.length;
        const confirmed = await args.denops.call(
          "confirm",
          `Delete ${count} comment(s)?`,
          "&Yes\n&No",
          2,
        ) as number;

        if (confirmed !== 1) {
          return ActionFlags.None;
        }

        for (const item of args.items) {
          const action = item.action as ActionData;
          await args.denops.call(
            "luaeval",
            "require('config.comments_core').delete_comment(_A[1], _A[2], _A[3])",
            [action.toplevel, action.relpath, action.lineNr],
          );
        }

        return ActionFlags.RefreshItems;
      },
    },
  };

  override params(): Params {
    return {};
  }
}
