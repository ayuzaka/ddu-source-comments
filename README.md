# ddu-source-comments

A [ddu.vim](https://github.com/Shougo/ddu.vim) source that lists and operates on
diff comments stored by `comments_core`.

## Requirements

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [ddu.vim](https://github.com/Shougo/ddu.vim)
- [ddu-kind-file](https://github.com/Shougo/ddu-kind-file)

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "ayuzaka/ddu-source-comments",
  dependencies = {
    "Shougo/ddu.vim",
    "Shougo/ddu-kind-file",
  },
  config = function()
    vim.keymap.set("n", "<leader>dc", function()
      vim.fn["ddu#start"]({ name = "comments" })
    end, { desc = "ddu comments" })
  end,
}
```

## ddu Configuration

```typescript
args.contextBuilder.patchLocal("comments", {
  sources: [{ name: "comments" }],
  kindOptions: {
    comments: {
      defaultAction: "open",
    },
  },
});
```

## Actions

| Action   | Description                                          |
| -------- | ---------------------------------------------------- |
| `open`   | Jump to the file and line where the comment was made |
| `delete` | Delete the selected comment(s) with confirmation     |

`open` is inherited from `ddu-kind-file`.

## Features

- Shows comments within the current Git repository's toplevel
- Display format: `relpath:linenumber │ comment first line` (80 chars max)
- Full comment text is preserved in `word` for filtering
- Fail-soft: returns an empty list with a console warning when the Lua core is
  unavailable

## Development

```bash
# Run tests
deno task test
```

## License

MIT
