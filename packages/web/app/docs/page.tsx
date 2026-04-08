import DocsSidebar from "@/components/DocsSidebar";
import { ArrowRight, Book, Terminal, Settings } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col md:flex-row gap-16 min-h-[calc(100vh-100px)]">
      <DocsSidebar />
      <main className="flex-grow max-w-3xl">
        <h1 className="text-5xl font-black italic mb-8">Documentation</h1>
        <p className="text-xl text-muted-foreground italic mb-12">
           Learn everything you need to build, test, and deploy Model Context Protocol (MCP) servers with MCPProbe.
        </p>

        <section className="space-y-12">
          <div className="p-8 rounded-3xl bg-white/2 border border-white/10 hover:border-brand-primary/20 transition-all group">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
               <Book className="size-6 text-brand-primary" />
               Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 italic">
               MCPProbe is an advanced diagnostic suite designed to help developers validate MCP server implementations. It provides real-time tool discovery, client-specific compatibility checks, and a qualitative scoring system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/docs/cli" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 flex flex-col gap-2 group transition-all">
                <div className="flex items-center justify-between">
                  <Terminal className="size-4 text-brand-secondary" />
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold">CLI Guide</div>
                <div className="text-xs text-muted-foreground">Master the zero-install CLI.</div>
              </Link>
              <Link href="/docs/api" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 flex flex-col gap-2 group transition-all">
                 <div className="flex items-center justify-between">
                  <Settings className="size-4 text-brand-primary" />
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold">API Reference</div>
                <div className="text-xs text-muted-foreground">Integrate MCPProbe into your apps.</div>
              </Link>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-[#666]">
               Quick Start
             </h3>
             <div className="rounded-2xl border border-white/10 bg-[#020202] p-8 font-mono text-sm group relative overflow-hidden transition-all shadow-2xl">
               <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative text-brand-secondary">
                 <span className="text-muted-foreground select-none">$</span> npx mcpprobe <span className="text-white underline">https://github.com/owner/repo</span>
               </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
