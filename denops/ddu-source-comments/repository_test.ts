import { assertEquals } from "@std/assert";
import { readAll } from "./repository.ts";
import type { Denops } from "@denops/core";
import type { CommentData } from "./types.ts";

class FakeDenops implements Denops {
  readonly name = "fake";
  readonly meta = {
    mode: "test" as const,
    host: "nvim" as const,
    version: "0.10.0",
    platform: "mac" as const,
  };
  readonly context = {};
  dispatcher = {};

  calls: { fn: string; args: unknown[] }[] = [];

  constructor(private returnValue: unknown) {}

  redraw(_force?: boolean): Promise<void> {
    return Promise.resolve();
  }

  call(fn: string, ...args: unknown[]): Promise<unknown> {
    this.calls.push({ fn, args });
    return Promise.resolve(this.returnValue);
  }

  batch(..._calls: [string, ...unknown[]][]): Promise<unknown[]> {
    return Promise.resolve([]);
  }

  cmd(_cmd: string, _ctx?: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }

  eval(_expr: string, _ctx?: Record<string, unknown>): Promise<unknown> {
    return Promise.resolve(this.returnValue);
  }

  dispatch(
    _name: string,
    _fn: string,
    ..._args: unknown[]
  ): Promise<unknown> {
    return Promise.resolve(this.returnValue);
  }
}

Deno.test("givenValidJson_whenReadAllCalled_returnsParsedComments", async () => {
  // Arrange
  const rawComments: CommentData[] = [
    { relpath: "a.ts", linenumber: 1, comment: "TODO" },
    { relpath: "b.ts", linenumber: 2, comment: "FIXME" },
  ];
  const fakeDenops = new FakeDenops(JSON.stringify(rawComments));

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, rawComments);
});

Deno.test("givenEmptyJsonArray_whenReadAllCalled_returnsEmptyArray", async () => {
  // Arrange
  const fakeDenops = new FakeDenops("[]");

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, []);
});

Deno.test("whenReadAllCalled_invokesLuaevalWithToplevelArgument", async () => {
  // Arrange
  const fakeDenops = new FakeDenops("[]");

  // Act
  await readAll(fakeDenops, "/home/user/repo");

  // Assert
  assertEquals(fakeDenops.calls.length, 1);
  assertEquals(fakeDenops.calls[0].fn, "luaeval");
  assertEquals(fakeDenops.calls[0].args[0], "require('diff_comments_core').read_all(_A)");
  assertEquals(fakeDenops.calls[0].args[1], "/home/user/repo");
});
