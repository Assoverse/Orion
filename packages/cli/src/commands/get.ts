import { Command } from "commander";
import chalk from "chalk";

const renderServices = (services: any[]) => {
  console.log(chalk.bold("Services"));
  for (const service of services) {
    console.log(` - ${chalk.cyan(service.name)} (${service.status ?? "pending"}) x${service.replicas}`);
  }
};

export const getCommand = (program: Command) => {
  const get = program
    .command("get")
    .description("Retrieve Orion resources");

  get
    .command("services")
    .option("--server <url>", "Control plane URL", process.env.ORION_API ?? "http://localhost:6060")
    .action(async (options) => {
      const response = await fetch(`${options.server}/api/services`);
      if (!response.ok) {
        console.error("Unable to fetch services");
        process.exitCode = 1;
        return;
      }
      const data = await response.json();
      renderServices(data.items ?? []);
    });
};
