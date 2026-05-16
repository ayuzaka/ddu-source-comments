import { assertEquals } from "jsr:@std/assert@1";
import { readAll } from "./repository.ts";
import type { Denops } from "jsr:@denops/core@~7.0.0";
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
  assertEquals(
    fakeDenops.calls[0].args[0],
    "require('config.comments_core').read_all(_A)",
  );
  assertEquals(fakeDenops.calls[0].args[1], "/home/user/repo");
});

Deno.test("givenArrayDirectly_whenReadAllCalled_returnsArrayAsIs", async () => {
  // Arrange
  const rawComments: CommentData[] = [
    { relpath: "a.ts", linenumber: 1, comment: "TODO" },
    { relpath: "b.ts", linenumber: 2, comment: "FIXME" },
  ];
  const fakeDenops = new FakeDenops(rawComments);

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, rawComments);
});

Deno.test("givenUnexpectedObject_whenReadAllCalled_returnsEmptyArray", async () => {
  // Arrange
  const fakeDenops = new FakeDenops({ foo: "bar" });

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, []);
});

Deno.test("givenNull_whenReadAllCalled_returnsEmptyArray", async () => {
  // Arrange
  const fakeDenops = new FakeDenops(null);

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, []);
});

Deno.test("givenNestedObjectWithToplevel_whenReadAllCalled_returnsParsedComments", async () => {
  // Arrange
  const nestedResult = {
    "/proj": {
      "README.md": { "13": "Cline??" },
      "src/main.ts": { "7": "あー" },
    },
  };
  const fakeDenops = new FakeDenops(nestedResult);

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, [
    { relpath: "README.md", linenumber: 13, comment: "Cline??" },
    { relpath: "src/main.ts", linenumber: 7, comment: "あー" },
  ]);
});

Deno.test("givenNestedObjectWithoutToplevel_whenReadAllCalled_returnsParsedComments", async () => {
  // Arrange
  const nestedResult = {
    "README.md": { "1": "TODO" },
    "src/main.ts": { "5": "FIXME" },
  };
  const fakeDenops = new FakeDenops(nestedResult);

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, [
    { relpath: "README.md", linenumber: 1, comment: "TODO" },
    { relpath: "src/main.ts", linenumber: 5, comment: "FIXME" },
  ]);
});

Deno.test("givenEmptyNestedObject_whenReadAllCalled_returnsEmptyArray", async () => {
  // Arrange
  const fakeDenops = new FakeDenops({ "/proj": {} });

  // Act
  const result = await readAll(fakeDenops, "/proj");

  // Assert
  assertEquals(result, []);
});
