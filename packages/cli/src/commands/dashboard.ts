import { Command } from "commander";
import ora from "ora";
import { spawn } from "node:child_process";
import path from "node:path";

export const dashboardCommand = (program: Command) => {
  program
    .command("dashboard")
    .description("Open the Orion dashboard (local mode)")
    .option("--port <number>", "Dashboard port", "3000")
    .option("--dev", "Launch Next.js in dev mode", false)
    .action((options) => {
      const spinner = ora("Starting dashboard...").start();
      const cwd = path.resolve(process.cwd(), "packages/dashboard");
      const command = options.dev ? "pnpm" : "pnpm";
      const args = options.dev ? ["run", "dev", "--", "-p", options.port] : ["run", "start", "--", "-p", options.port];
      const child = spawn(command, args, {
        cwd,
        stdio: "inherit",
        env: { ...process.env, PORT: options.port },
      });
      spinner.succeed(`Dashboard running at http://localhost:${options.port}`);
      child.on("exit", (code) => process.exit(code ?? 0));
    });
};
