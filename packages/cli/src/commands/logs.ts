import { Command } from "commander";
import chalk from "chalk";

export const logsCommand = (program: Command) => {
  program
    .command("logs")
    .description("Display logs for an Orion service")
    .argument("<service>", "Service name")
    .option("-f, --follow", "Stream logs in real time", false)
    .option("--server <url>", "Control plane URL", process.env.ORION_API ?? "http://localhost:6060")
    .action(async (service, options) => {
      console.log(chalk.yellow(`Live log streaming for ${service} is not implemented yet.`));
      console.log(`Use --follow once streaming support lands in a future release.`);
      void options;
    });
};
