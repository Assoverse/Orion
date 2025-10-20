#!/usr/bin/env node
import { Command } from "commander";
import { applyCommand } from "./commands/apply.js";
import { initCommand } from "./commands/init.js";
import { getCommand } from "./commands/get.js";
import { logsCommand } from "./commands/logs.js";
import { execCommand } from "./commands/exec.js";
import { dashboardCommand } from "./commands/dashboard.js";

const program = new Command();
program
  .name("orion")
  .description("Orion – JavaScript/TypeScript orchestrator for JS services.")
  .version("0.1.0");

initCommand(program);
applyCommand(program);
getCommand(program);
logsCommand(program);
execCommand(program);
dashboardCommand(program);

program.parseAsync(process.argv);
