import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";

const DEFAULT_CONFIG = `apiVersion: orion/v1
kind: Config
metadata:
  name: orion-sample
  environment: dev
spec:
  services:
    - name: api-users
      path: ./services/users
      entry: src/index.ts
      replicas: 1
      env:
        NODE_ENV: development
      ports:
        - name: http
          port: 4000
  nodes: []
  plugins: []
`;

export const initCommand = (program: Command) => {
  program
    .command("init")
    .description("Generate a default orion.yaml file")
    .option("-f, --file <path>", "Output file name", "orion.yaml")
    .action(async (options) => {
      const dest = path.resolve(process.cwd(), options.file);
      await fs.writeFile(dest, DEFAULT_CONFIG, { encoding: "utf-8", flag: "wx" }).catch(async (error) => {
        if (error.code === "EEXIST") {
          throw new Error(`The file ${options.file} already exists.`);
        }
        throw error;
      });
      console.log(`Created ${options.file}.`);
    });
};
