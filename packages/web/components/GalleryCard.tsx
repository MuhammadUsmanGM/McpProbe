import { Star, ShieldCheck, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CompatEntry } from "@/lib/types";

interface GalleryCardProps {
  id: string;
  name: string;
  stars: number;
  score: number;
  grade: string;
  toolsCount: number;
  compatibility: CompatEntry[];
  probedAt: string;
}

export default function GalleryCard({ id, name, stars, score, grade, toolsCount, compatibility, probedAt }: GalleryCardProps) {
  const readyClients = compatibility.filter(c => c.status === 'ready');
  
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary/30 transition-all group flex flex-col h-full bg-gradient-to-br from-transparent to-brand-primary/5">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-4">{name}</h3>
        <div className={`p-4 rounded-2xl flex items-center justify-center font-black italic text-xl border ${
          grade === 'A' ? 'bg-brand-secondary/20 border-brand-secondary/30 text-brand-secondary' :
          grade === 'B' ? 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary' :
          grade === 'C' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' :
          'bg-destructive/20 border-destructive/30 text-destructive'
        }`}>
          {grade}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <Star className="size-3 text-yellow-500/50" />
          {stars}
        </div>
        <div className="flex items-center gap-1">
          <Layers className="size-3" />
          {toolsCount} tools
        </div>
        <div className="flex items-center gap-1 italic">
          {new Date(probedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 mt-auto">
        {readyClients.length > 0 ? (
          readyClients.map((c, i) => (
            <span key={i} className="px-2 py-1 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg text-[10px] font-black tracking-widest text-brand-secondary uppercase">
               {c.client}
            </span>
          ))
        ) : (
          <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black tracking-widest text-muted-foreground uppercase italic px-3">
             Dev Only
          </span>
        )}
      </div>

      <Link 
        href={`/probe/${id}`} 
        className="w-full bg-white/5 group-hover:bg-brand-primary group-hover:text-white transition-all py-3 rounded-xl flex items-center justify-center gap-2 font-bold group-hover:premium-shadow"
      >
        View Report
        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
