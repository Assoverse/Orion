const API_URL = process.env.ORION_API_URL ?? "http://localhost:6060";

interface ServiceItem {
  id: string;
  name: string;
  status?: string;
  replicas: number;
}

interface NodeItem {
  id: string;
  name: string;
  address: string;
  status: string;
}

const fetchJSON = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} (${response.status})`);
  }
  return (await response.json()) as T;
};

export const getServices = () =>
  fetchJSON<{ items: ServiceItem[] }>("/api/services");

export const getNodes = () =>
  fetchJSON<{ items: NodeItem[] }>("/api/nodes").catch(() => ({ items: [] }));

export const getClusterState = async () => {
  const [services, nodes] = await Promise.allSettled([getServices(), getNodes()]);
  return {
    services: services.status === "fulfilled" ? services.value.items : [],
    nodes: nodes.status === "fulfilled" ? nodes.value.items : [],
  };
};
