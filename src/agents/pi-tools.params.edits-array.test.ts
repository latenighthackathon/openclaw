// SPDX-FileCopyrightText: Copyright (c) 2025 OpenClaw Contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import {
  normalizeToolParams,
  assertRequiredParams,
  CLAUDE_PARAM_GROUPS,
} from "./pi-tools.params.js";

describe("normalizeToolParams — edits[] array hoisting", () => {
  it("hoists oldText and newText from edits[0] to top level", () => {
    const params = {
      file: "test.ts",
      edits: [{ oldText: "hello", newText: "world" }],
    };
    const normalized = normalizeToolParams(params);
    expect(normalized).toBeDefined();
    expect(normalized!.oldText).toBe("hello");
    expect(normalized!.newText).toBe("world");
  });

  it("does not overwrite existing top-level params with edits[] values", () => {
    const params = {
      file: "test.ts",
      oldText: "top-level",
      newText: "top-level-new",
      edits: [{ oldText: "nested", newText: "nested-new" }],
    };
    const normalized = normalizeToolParams(params);
    expect(normalized!.oldText).toBe("top-level");
    expect(normalized!.newText).toBe("top-level-new");
  });

  it("handles edits[] with alias keys (old_string, new_string)", () => {
    const params = {
      file: "test.ts",
      edits: [{ old_string: "hello", new_string: "world" }],
    };
    const normalized = normalizeToolParams(params);
    // After hoisting from edits[0], normalizeClaudeParamAliases converts
    // old_string -> oldText and new_string -> newText
    expect(normalized!.oldText).toBe("hello");
    expect(normalized!.newText).toBe("world");
  });

  it("ignores empty edits array", () => {
    const params = {
      file: "test.ts",
      edits: [],
    };
    const normalized = normalizeToolParams(params);
    expect(normalized).toBeDefined();
    expect(normalized!.oldText).toBeUndefined();
  });

  it("passes assertRequiredParams after edits[] hoisting", () => {
    const params = {
      file: "test.ts",
      edits: [{ oldText: "hello", newText: "world" }],
    };
    const normalized = normalizeToolParams(params);
    expect(() => {
      assertRequiredParams(normalized, CLAUDE_PARAM_GROUPS.edit, "edit");
    }).not.toThrow();
  });

  it("still fails assertRequiredParams when edits[] has no oldText/newText", () => {
    const params = {
      file: "test.ts",
      edits: [{ unrelated: "value" }],
    };
    const normalized = normalizeToolParams(params);
    expect(() => {
      assertRequiredParams(normalized, CLAUDE_PARAM_GROUPS.edit, "edit");
    }).toThrow(/Missing required/);
  });
});
