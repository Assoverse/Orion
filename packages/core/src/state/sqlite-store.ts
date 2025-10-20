import Database from "better-sqlite3";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { OrionConfig } from "@orion/shared";
import {
  DeploymentRecord,
  NodeRecord,
  ServiceRecord,
  StateStore,
} from "./state-store.js";
import { generateId } from "@orion/shared";
import { logger } from "../logger.js";

export interface SQLiteStateStoreOptions {
  filepath?: string;
}

const serialize = (value: unknown): string => JSON.stringify(value ?? null);
const deserialize = <T>(value: unknown): T =>
  typeof value === "string" ? (JSON.parse(value) as T) : (value as T);

export class SQLiteStateStore implements StateStore {
  private db!: Database.Database;
  private filepath: string;

  constructor(options: SQLiteStateStoreOptions = {}) {
    const dataDir = process.env.ORION_DATA_DIR ?? path.resolve(process.cwd(), ".orion");
    this.filepath = options.filepath ?? path.join(dataDir, "state.sqlite");
  }

  async initialize(): Promise<void> {
    const dir = path.dirname(this.filepath);
    await fsEnsureDir(dir);
    this.db = new Database(this.filepath);

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS services(
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE,
          spec TEXT,
          status TEXT,
          createdAt INTEGER,
          updatedAt INTEGER
        )`
      )
      .run();

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS nodes(
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE,
          address TEXT,
          labels TEXT,
          capacity TEXT,
          status TEXT,
          lastHeartbeat INTEGER
        )`
      )
      .run();

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS deployments(
          id TEXT PRIMARY KEY,
          serviceId TEXT,
          nodeId TEXT,
          replicaId TEXT,
          status TEXT,
          createdAt INTEGER,
          updatedAt INTEGER
        )`
      )
      .run();
  }

  async applyConfig(config: OrionConfig): Promise<void> {
    const now = Date.now();
    const upsert = this.db.prepare(
      `INSERT INTO services(id,name,spec,status,createdAt,updatedAt)
        VALUES(@id,@name,@spec,@status,@createdAt,@updatedAt)
        ON CONFLICT(name) DO UPDATE SET spec=@spec, updatedAt=@updatedAt`
    );

    const serviceUpsertTx = this.db.transaction((services: ServiceRecord[]) => {
      for (const service of services) {
        upsert.run({
          id: service.id,
          name: service.name,
          spec: serialize(service),
          status: service.status,
          createdAt: service.createdAt,
          updatedAt: now,
        });
      }
    });

    const existingRows = this.db
      .prepare(`SELECT name, spec FROM services`)
      .all()
      .map((row) => [row.name as string, deserialize<ServiceRecord>(row.spec)]);
    const existing = new Map<string, ServiceRecord>(existingRows);

    const records = config.spec.services.map<ServiceRecord>((svc) => {
      const previous = existing.get(svc.name);
      return {
        ...svc,
        id: previous?.id ?? generateId(`svc-${svc.name}`),
        status: previous?.status ?? "pending",
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
        replicas: svc.replicas ?? 1,
      };
    });

    serviceUpsertTx(records);

    if (config.spec.nodes?.length) {
      const nodeUpsert = this.db.prepare(
        `INSERT INTO nodes(id,name,address,labels,capacity,status,lastHeartbeat)
        VALUES(@id,@name,@address,@labels,@capacity,@status,@lastHeartbeat)
        ON CONFLICT(name) DO UPDATE SET address=@address, labels=@labels, capacity=@capacity, status=@status`
      );

      const nodeTx = this.db.transaction(() => {
        for (const node of config.spec.nodes) {
          const id = generateId(`node-${node.name}`);
          nodeUpsert.run({
            id,
            name: node.name,
            address: node.address ?? "unknown",
            labels: serialize(node.labels ?? {}),
            capacity: serialize(node.capacity ?? {}),
            status: "ready",
            lastHeartbeat: now,
          });
        }
      });
      nodeTx();
    }
    logger.info("Configuration applied", {
      count: records.length,
      environment: config.metadata?.environment,
    });
  }

  async listServices(): Promise<ServiceRecord[]> {
    const rows = this.db.prepare(`SELECT spec FROM services`).all();
    return rows.map((row) => deserialize<ServiceRecord>(row.spec));
  }

  async getServiceByName(name: string): Promise<ServiceRecord | undefined> {
    const row = this.db
      .prepare(`SELECT spec FROM services WHERE name = ?`)
      .get(name);
    return row ? deserialize<ServiceRecord>(row.spec) : undefined;
  }

  async upsertService(service: ServiceRecord): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO services(id,name,spec,status,createdAt,updatedAt)
        VALUES(@id,@name,@spec,@status,@createdAt,@updatedAt)
        ON CONFLICT(name) DO UPDATE SET spec=@spec, status=@status, updatedAt=@updatedAt`
      )
      .run({
        ...service,
        spec: serialize(service),
        createdAt: service.createdAt ?? now,
        updatedAt: now,
      });
  }

  async removeServiceByName(name: string): Promise<void> {
    this.db.prepare(`DELETE FROM services WHERE name = ?`).run(name);
  }

  async listNodes(): Promise<NodeRecord[]> {
    const rows = this.db.prepare(`SELECT * FROM nodes`).all();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      labels: deserialize<Record<string, string>>(row.labels),
      capacity: deserialize<NodeRecord["capacity"]>(row.capacity),
      status: row.status,
      lastHeartbeat: row.lastHeartbeat ?? undefined,
    }));
  }

  async upsertNode(node: NodeRecord): Promise<void> {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO nodes(id,name,address,labels,capacity,status,lastHeartbeat)
        VALUES(@id,@name,@address,@labels,@capacity,@status,@lastHeartbeat)
        ON CONFLICT(name) DO UPDATE SET address=@address, labels=@labels, capacity=@capacity, status=@status, lastHeartbeat=@lastHeartbeat`
      )
      .run({
        ...node,
        labels: serialize(node.labels),
        capacity: serialize(node.capacity),
        lastHeartbeat: node.lastHeartbeat ?? now,
      });
  }

  async updateNodeHeartbeat(nodeId: string): Promise<void> {
    this.db
      .prepare(`UPDATE nodes SET lastHeartbeat = ?, status = ? WHERE id = ?`)
      .run(Date.now(), "ready", nodeId);
  }

  async listDeployments(): Promise<DeploymentRecord[]> {
    const rows = this.db.prepare(`SELECT * FROM deployments`).all();
    return rows.map((row) => ({
      id: row.id,
      serviceId: row.serviceId,
      nodeId: row.nodeId,
      replicaId: row.replicaId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async upsertDeployment(deployment: DeploymentRecord): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO deployments(id,serviceId,nodeId,replicaId,status,createdAt,updatedAt)
        VALUES(@id,@serviceId,@nodeId,@replicaId,@status,@createdAt,@updatedAt)
        ON CONFLICT(id) DO UPDATE SET status=@status, updatedAt=@updatedAt`
      )
      .run(deployment);
  }

  async updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentRecord["status"]
  ): Promise<void> {
    this.db
      .prepare(`UPDATE deployments SET status = ?, updatedAt = ? WHERE id = ?`)
      .run(status, Date.now(), deploymentId);
  }
}

const fsEnsureDir = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};
