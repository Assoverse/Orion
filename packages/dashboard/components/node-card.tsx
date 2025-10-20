type NodeCardProps = {
  name: string;
  status: string;
  address: string;
};

export const NodeCard = ({ name, status, address }: NodeCardProps) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-medium text-slate-100">{name}</h3>
        <p className="text-xs text-slate-500">{address}</p>
      </div>
      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
        {status}
      </span>
    </div>
  </div>
);
