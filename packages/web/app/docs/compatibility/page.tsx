import DocsSidebar from "@/components/DocsSidebar";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function CompatibilityDocsPage() {
  const clients = [
    { name: "Claude Desktop", transport: "stdio", status: "Native", desc: "First-party support for all MCP stdio servers." },
    { name: "Cursor", transport: "stdio, http", status: "Optimized", desc: "Supports local HTTP servers and stdio pipelines." },
    { name: "Windsurf", transport: "stdio, http", status: "Full", desc: "Modern IDE with seamless integration for both transports." },
    { name: "Cline", transport: "stdio", status: "Native", desc: "Requires stdio transport for local command execution." }
  ];

  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col md:flex-row gap-16 min-h-[calc(100vh-100px)]">
      <DocsSidebar />
      <main className="flex-grow max-w-3xl">
        <div className="flex items-center gap-3 mb-6 p-2 w-fit bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4">
           <ShieldCheck className="size-4 text-brand-primary" />
           <span className="font-mono text-xs uppercase tracking-widest text-brand-primary font-bold italic">Integrations</span>
        </div>
        <h1 className="text-5xl font-black italic mb-8 border-b border-white/5 pb-8">Compatibility Matrix</h1>
        <p className="text-xl text-muted-foreground italic mb-12 border-l-2 border-brand-primary/20 pl-8">
           Each AI client has specific transport and documentation requirements. Use our matrix to identify setup gaps.
        </p>

        <section className="space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {clients.map((c, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/2 border border-white/10 hover:border-brand-primary/20 transition-all flex flex-col gap-6 group">
                   <div className="flex justify-between items-start">
                      <div className="font-black text-2xl italic">{c.name}</div>
                      <div className="px-3 py-1 bg-brand-secondary/20 text-brand-secondary rounded-lg text-[10px] font-black uppercase tracking-widest">
                         {c.status}
                      </div>
                   </div>
                   <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-white/5 pl-4 flex-grow">
                      {c.desc}
                   </p>
                   <div className="mt-4 flex items-center gap-2 font-mono text-xs text-brand-primary">
                      <span className="text-muted-foreground uppercase tracking-widest text-[9px] mr-2">Transports:</span>
                      {c.transport}
                   </div>
                </div>
              ))}
           </div>

           <div className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 flex flex-col gap-6 italic">
              <h3 className="flex items-center gap-2 text-yellow-500 font-bold">
                 <AlertTriangle className="size-5" />
                 Warning: HTTP vs STDIO
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                 Some clients (like Claude Desktop) specifically require <strong>STDIO</strong> transport for local process communication. If you're building a remote SaaS, you'll need an HTTP bridge or an adapter for these clients.
              </p>
           </div>
        </section>
      </main>
    </div>
  );
}
