import { ClusterMetrics } from "../components/cluster-metrics";
import { ServiceCard } from "../components/service-card";
import { NodeCard } from "../components/node-card";
import { getClusterState } from "../lib/api";

export default async function Home() {
  const { services, nodes } = await getClusterState();
  const totalReplicas = services.reduce((acc, service) => acc + (service.replicas ?? 1), 0);

  return (
    <div className="space-y-12">
      <section id="overview" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Cluster summary</h2>
          <p className="text-sm text-slate-400">High-level view of the current state.</p>
        </div>
        <ClusterMetrics services={services.length} nodes={nodes.length} replicas={totalReplicas} />
      </section>

      <section id="services" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Services</h2>
            <p className="text-sm text-slate-400">Active deployments declared in Orion.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id ?? service.name}
              name={service.name}
              status={service.status ?? "pending"}
              replicas={service.replicas ?? 1}
            />
          ))}
          {!services.length && (
            <p className="text-sm text-slate-500">No services deployed yet. Run `orion apply` to get started.</p>
          )}
        </div>
      </section>

      <section id="nodes" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Nodes</h2>
          <p className="text-sm text-slate-400">Agents currently connected to the control plane.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nodes.map((node) => (
            <NodeCard key={node.id} name={node.name} status={node.status} address={node.address} />
          ))}
          {!nodes.length && (
            <p className="text-sm text-slate-500">No agents connected. Start `orion-agent` on your machines.</p>
          )}
        </div>
      </section>

      <section id="logs" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Live logs</h2>
          <p className="text-sm text-slate-400">WebSocket streaming will arrive in an upcoming release.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          <p>
            Orion will soon aggregate logs per replica with full-text search and per-service highlighting.
          </p>
        </div>
      </section>
    </div>
  );
}
