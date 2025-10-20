import { z } from "zod";

export const portSchema = z.object({
  name: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(["tcp", "udp"]).default("tcp"),
  targetPort: z.number().int().min(1).max(65535).optional(),
});

export const envVarSchema = z.record(z.string().min(1), z.string());

export const resourceSchema = z.object({
  cpu: z.number().positive().optional(),
  memory: z.number().positive().optional(),
});

export const scheduleSchema = z
  .string()
  .regex(/^[^\n\r]+$/, "cron expression must be a single line")
  .optional();

export const hookSchema = z.object({
  beforeStart: z.string().optional(),
  afterDeploy: z.string().optional(),
});

export const autoscalingPolicySchema = z
  .object({
    enabled: z.boolean().default(false),
    minReplicas: z.number().int().min(1).default(1),
    maxReplicas: z.number().int().min(1).default(5),
    scaleUpThreshold: z.number().min(0).max(1).default(0.75),
    scaleDownThreshold: z.number().min(0).max(1).default(0.25),
    scaleDownDelaySeconds: z.number().int().min(0).default(60),
  })
  .optional();

export const serviceSchema = z.object({
  name: z.string().min(1),
  path: z.string().default("."),
  type: z
    .enum(["node", "nextjs", "bun", "deno", "vite", "worker"])
    .default("node"),
  entry: z.string().default("index.ts"),
  command: z.string().optional(),
  runtime: z.enum(["node", "bun", "deno"]).default("node"),
  replicas: z.number().int().min(1).default(1),
  ports: z.array(portSchema).optional(),
  env: envVarSchema.default({}),
  resources: resourceSchema.default({}),
  schedule: scheduleSchema,
  hooks: hookSchema.optional(),
  plugins: z.array(z.string()).default([]),
  autoscaling: autoscalingPolicySchema,
  serverless: z
    .object({
      enabled: z.boolean().default(false),
      trigger: z.enum(["http", "cron", "queue"]).default("http"),
      queue: z.string().optional(),
    })
    .optional(),
  labels: z.record(z.string(), z.string()).default({}),
  dependencies: z.array(z.string()).default([]),
});

export const nodeSchema = z.object({
  name: z.string(),
  address: z.string(),
  labels: z.record(z.string(), z.string()).default({}),
  capacity: resourceSchema.default({}),
});

export const configSchema = z.object({
  apiVersion: z.literal("orion/v1").default("orion/v1"),
  kind: z.literal("Config").default("Config"),
  metadata: z
    .object({
      name: z.string().default("default"),
      description: z.string().optional(),
      environment: z.string().default("dev"),
    })
    .default({ name: "default", environment: "dev" }),
  spec: z.object({
    services: z.array(serviceSchema).default([]),
    nodes: z.array(nodeSchema).default([]),
    plugins: z.array(z.string()).default([]),
  }),
});

export type OrionConfig = z.infer<typeof configSchema>;
export type OrionService = z.infer<typeof serviceSchema>;
