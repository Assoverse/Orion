import { describe, expect, it } from "vitest";
import { Command } from "commander";
import { initCommand } from "../src/commands/init.js";
import { applyCommand } from "../src/commands/apply.js";
import { getCommand } from "../src/commands/get.js";

describe("CLI command registration", () => {
  it("registers core commands", () => {
    const program = new Command();
    initCommand(program);
    applyCommand(program);
    getCommand(program);

    const names = program.commands.map((cmd) => cmd.name());
    expect(names).toEqual(expect.arrayContaining(["init", "apply", "get"]));
  });
});
