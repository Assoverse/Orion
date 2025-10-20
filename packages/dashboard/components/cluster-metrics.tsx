type ClusterMetricsProps = {
  services: number;
  nodes: number;
  replicas: number;
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
  </div>
);

export const ClusterMetrics = ({ services, nodes, replicas }: ClusterMetricsProps) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <Metric label="Services" value={services} />
    <Metric label="Nodes" value={nodes} />
    <Metric label="Replicas" value={replicas} />
  </div>
);
