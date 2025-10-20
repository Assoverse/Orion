import clsx from "clsx";

type ServiceCardProps = {
  name: string;
  status?: string;
  replicas: number;
};

const statusColors: Record<string, string> = {
  running: "bg-emerald-500/20 text-emerald-300",
  pending: "bg-amber-500/20 text-amber-300",
  failed: "bg-rose-500/20 text-rose-300",
};

export const ServiceCard = ({ name, status = "pending", replicas }: ServiceCardProps) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-lg shadow-slate-950/60">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
      <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", statusColors[status] ?? statusColors.pending)}>
        {status}
      </span>
    </div>
    <p className="mt-2 text-sm text-slate-400">Replicas : {replicas}</p>
  </div>
);
