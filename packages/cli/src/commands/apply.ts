import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import ora from "ora";
import YAML from "yaml";
import { configSchema } from "@orion/shared";

const DEFAULT_FILE = "orion.yaml";

export const applyCommand = (program: Command) => {
  program
    .command("apply")
    .description("Apply an Orion configuration file")
    .requiredOption("-f, --file <path>", "Configuration file", DEFAULT_FILE)
    .option("--server <url>", "Control plane URL", process.env.ORION_API ?? "http://localhost:6060")
    .action(async (options) => {
      const spinner = ora("Validating configuration...").start();
      try {
        const filePath = path.resolve(process.cwd(), options.file);
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = filePath.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
        const validation = configSchema.safeParse(parsed);
        if (!validation.success) {
          spinner.fail("Invalid configuration");
          for (const issue of validation.error.issues) {
            console.error(` - ${issue.path.join(".")}: ${issue.message}`);
          }
          process.exitCode = 1;
          return;
        }
        spinner.text = "Sending to control plane";
        const response = await fetch(`${options.server}/api/apply`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(validation.data),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          spinner.fail("Failed to apply configuration");
          console.error("Response:", error);
          process.exitCode = 1;
          return;
        }
        spinner.succeed("Configuration applied");
      } catch (error) {
        spinner.fail("Error applying configuration");
        console.error(error);
        process.exitCode = 1;
      }
    });
};
