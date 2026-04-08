"use client";

import { useEffect, useState } from "react";
import { Globe, Layers, Zap } from "lucide-react";

export default function StatsBar() {
  const [stats, setStats] = useState({
    total_probes: 0,
    total_tools: 0,
    total_configs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const items = [
    { label: "Servers Probed", value: stats.total_probes, icon: <Globe className="size-4" /> },
    { label: "Tools Discovered", value: stats.total_tools, icon: <Layers className="size-4" /> },
    { label: "Configs Generated", value: stats.total_configs, icon: <Zap className="size-4 text-brand-primary" /> },
  ];

  return (
    <div className="w-full flex justify-center py-12 border-y border-white/5 bg-gradient-to-r from-transparent via-brand-primary/2 to-transparent">
       <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-80">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group animate-in zoom-in duration-700">
               <div className="text-3xl font-black italic tracking-tighter counter-animation flex items-center gap-3">
                  {item.icon}
                  {item.value.toLocaleString()}
               </div>
               <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground group-hover:text-brand-primary transition-colors">
                  {item.label}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
