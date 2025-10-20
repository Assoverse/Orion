import { OrionConfig, OrionService } from "@orion/shared";

export interface ServiceRecord extends OrionService {
  id: string;
  status: "pending" | "running" | "failed" | "stopped";
  createdAt: number;
  updatedAt: number;
  replicas: number;
}

export interface NodeRecord {
  id: string;
  name: string;
  address: string;
  labels: Record<string, string>;
  capacity: {
    cpu?: number;
    memory?: number;
  };
  status: "ready" | "not-ready" | "unknown";
  lastHeartbeat?: number;
}

export interface DeploymentRecord {
  id: string;
  serviceId: string;
  nodeId: string;
  replicaId: string;
  status: "pending" | "running" | "failed" | "terminated";
  createdAt: number;
  updatedAt: number;
}

export interface StateStore {
  initialize(): Promise<void>;
  applyConfig(config: OrionConfig): Promise<void>;
  listServices(): Promise<ServiceRecord[]>;
  getServiceByName(name: string): Promise<ServiceRecord | undefined>;
  upsertService(service: ServiceRecord): Promise<void>;
  removeServiceByName(name: string): Promise<void>;
  listNodes(): Promise<NodeRecord[]>;
  upsertNode(node: NodeRecord): Promise<void>;
  updateNodeHeartbeat(nodeId: string): Promise<void>;
  listDeployments(): Promise<DeploymentRecord[]>;
  upsertDeployment(deployment: DeploymentRecord): Promise<void>;
  updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentRecord["status"]
  ): Promise<void>;
}
