import express from "express";

export const config = {
  name: "example-api",
  port: Number(process.env.PORT ?? 4000),
  replicas: 1,
  env: {
    NODE_ENV: "development",
  },
};

export async function start() {
  const app = express();
  app.get("/", (_, res) => {
    res.json({ message: "Hello from Orion simple service" });
  });
  app.listen(config.port, () => {
    console.log(`[example-api] listening on port ${config.port}`);
  });
}

if (process.env.ORION_MANAGED !== "true") {
  start();
}
