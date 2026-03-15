'use client';

export default function StatCard({ title, value, Icon, bgClass, borderClass }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-white border ${borderClass} shadow-sm group hover:shadow-lg transition-all duration-300 cursor-default`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-extrabold text-slate-800 mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${bgClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
        </div>
      </div>
      {/* subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
    </div>
  );
}
