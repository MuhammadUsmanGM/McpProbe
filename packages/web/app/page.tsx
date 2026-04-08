import { Package, ShieldCheck, Zap, Globe, Layers, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";


export default function Home() {
  const logo = `███╗   ███╗ ██████╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
██╔████╔██║██║     ██████╔╝██████╔╝██████╔╝██║   ██║██████╔╝█████╗  
██║╚██╔╝██║██║     ██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██╔══╝  
██║ ╚═╝ ██║╚██████╗██║     ██║     ██║  ██║╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`;

  const features = [
    {
      title: "Tools Discovery",
      description: "Instantly extract all exposed methods, their nested descriptions, and complex input schemas.",
      icon: <Layers className="size-6 text-brand-primary" />,
    },
    {
      title: "Client Compatibility",
      description: "Verify readiness across 13 major AI clients including Claude, Cursor, VS Code, Codex, Gemini CLI, Goose, and more.",
      icon: <ShieldCheck className="size-6 text-brand-secondary" />,
    },
    {
      title: "Health Score",
      description: "Automated 100-point grading system based on latency, documentation quality, and security.",
      icon: <Zap className="size-6 text-yellow-500" />,
    },
  ];

  return (
    <div className="w-full max-w-6xl px-6 py-12 md:py-20 flex flex-col items-center">
      {/* Branding Section */}
      <section className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <pre className="text-[0.4rem] md:text-[0.6rem] lg:text-xs leading-none font-bold text-brand-primary selection:bg-brand-primary/10">
          {logo}
        </pre>
        <p className="mt-6 text-brand-secondary font-mono tracking-widest text-sm md:text-base border-y border-brand-secondary/20 py-2">
          PROBE ANY MCP SERVER · TOOLS · COMPAT · SCORE · CONFIGS
        </p>
      </section>

      {/* Main CTA Section */}
      <section className="mt-16 w-full max-w-2xl flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center leading-tight">
          Analyze any MCP server <br />
          <span className="text-muted-foreground italic">&</span> get production ready.
        </h2>
        
        <form className="mt-12 w-full flex flex-col md:flex-row gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 premium-shadow">
          <input 
            type="url" 
            placeholder="Paste GitHub URL (e.g., https://github.com/...) "
            className="flex-grow bg-transparent px-4 py-3 outline-none text-lg overflow-hidden whitespace-nowrap text-ellipsis"
            required
          />
          <button 
            type="submit"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 group"
          >
            Probe Server
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-secondary animate-pulse" />
            V1.0.0 Stable
          </div>
          <div className="flex items-center gap-2">
            <Globe className="size-4" />
            Global Analysis
          </div>
          <div className="flex items-center gap-2">
            <Package className="size-4" />
            Zero-Install API
          </div>
        </div>
      </section>

      <StatsBar />

      {/* Features Grid */}
      <section className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div 
            key={i} 
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary/30 transition-all group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both"
            style={{ animationDelay: `${i * 200 + 400}ms` }}
          >
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-primary transition-colors">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </section>


      {/* Footer / Meta Section */}
      <footer className="mt-32 w-full pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
          <Link href="/gallery" className="hover:text-brand-primary transition-colors italic">Recent Probes</Link>
          <span>·</span>
          <Link href="/docs" className="hover:text-brand-primary transition-colors italic">Documentation</Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="https://github.com/MuhammadUsmanGM" target="_blank" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <svg className="size-6 text-muted-foreground hover:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">

              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="https://www.npmjs.com" target="_blank" className="hover:scale-105 transition-transform">
            <img src="https://img.shields.io/npm/v/mcpprobe.svg?style=flat-square&color=8B5CF6" alt="npm" />
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground/50">
          MIT © 2026 Muhammad Usman
        </p>
      </footer>
    </div>
  );
}
