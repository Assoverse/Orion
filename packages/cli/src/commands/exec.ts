import { Command } from "commander";
import chalk from "chalk";

export const execCommand = (program: Command) => {
  program
    .command("exec")
    .description("Execute a command inside an Orion replica")
    .argument("<service>", "Service name")
    .argument("<command...>", "Command to execute")
    .action((service, command) => {
      console.log(
        chalk.yellow(
          `orion exec is not available yet. Service: ${service}, command: ${command.join(" ")}`
        )
      );
    });
};
