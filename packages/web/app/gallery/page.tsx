"use client";

import { useEffect, useState, Suspense } from "react";
import { Search, SlidersHorizontal, RotateCw, AlertTriangle, ArrowLeft } from "lucide-react";
import GalleryCard from "@/components/GalleryCard";
import Link from "next/link";

interface GalleryItem {
  id: string;
  repo_name: string;
  repo_description: string;
  stars: number;
  transport: string;
  score: number;
  grade: string;
  tools_count: number;
  compatibility_list: any[];
  probed_at: string;
}

export default function GalleryPage() {
  const [probes, setProbes] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [filter, setFilter] = useState("");

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?search=${search}&sort=${sort}&filter=${filter}`);
      const data = await res.json();
      setProbes(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchGallery(), 300);
    return () => clearTimeout(timer);
  }, [search, sort, filter]);

  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col items-center">
      <Link href="/" className="self-start mb-12 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group text-sm font-mono uppercase tracking-widest">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Explore Hub
      </Link>

      <section className="w-full flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
        <div className="flex-grow">
          <h1 className="text-5xl font-black italic mb-4">Discovery Hub</h1>
          <p className="text-xl text-muted-foreground max-w-xl">
             Browse the fleet of community-probed servers. Find compatible toolsets, see scores, and grab local configs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-primary/50 transition-all font-mono text-sm"
            />
          </div>
          
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:border-brand-primary/50 transition-all font-mono text-sm hover:bg-white/10 cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="score">Highest Score</option>
            <option value="stars">Most Stars</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="w-full py-40 flex flex-col items-center justify-center text-brand-primary/50 animate-pulse">
           <RotateCw className="size-12 animate-spin mb-6" />
           <span className="font-mono italic uppercase tracking-widest text-sm">Dissecting Database...</span>
        </div>
      ) : probes.length > 0 ? (
        <div 
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
           {probes.map((p, i) => (
             <div 
               key={p.id}
               className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
               style={{ animationDelay: `${i * 100}ms` }}
             >
               <GalleryCard 
                 id={p.id}
                 name={p.repo_name}
                 stars={p.stars}
                 score={p.score}
                 grade={p.grade}
                 toolsCount={p.tools_count}
                 compatibility={p.compatibility_list}
                 probedAt={p.probed_at}
               />
             </div>
           ))}
        </div>
      ) : (
        <div className="w-full py-40 rounded-3xl border border-white/5 bg-white/2 flex flex-col items-center justify-center text-muted-foreground italic">
           <AlertTriangle className="size-16 mb-4 opacity-30" />
           No probes found matching your filter.
        </div>
      )}
    </div>
  );
}
