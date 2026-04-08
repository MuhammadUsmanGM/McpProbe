import DocsSidebar from "@/components/DocsSidebar";
import { Terminal, Copy, ArrowRight, Layers, ShieldCheck, Zap } from "lucide-react";

export default function CliDocsPage() {
  const commands = [
    { cmd: "npx mcpprobe <github-url>", label: "Basic probe" },
    { cmd: "npx mcpprobe <github-url> --json", label: "Save report as JSON" },
    { cmd: "npx mcpprobe <github-url> --md", label: "Save report as Markdown" },
    { cmd: "npx mcpprobe <github-url> --tools", label: "Only show tools" },
    { cmd: "npx mcpprobe <github-url> --config cursor", label: "Show Cursor config" },
  ];

  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col md:flex-row gap-16 min-h-[calc(100vh-100px)]">
      <DocsSidebar />
      <main className="flex-grow max-w-3xl">
        <div className="flex items-center gap-3 mb-6 p-2 w-fit bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4">
           <Terminal className="size-4 text-brand-primary" />
           <span className="font-mono text-xs uppercase tracking-widest text-brand-primary font-bold italic">CLI Guide</span>
        </div>
        <h1 className="text-5xl font-black italic mb-8">Zero-Install CLI</h1>
        <p className="text-xl text-muted-foreground italic mb-12">
           The MCPProbe CLI is the fastest way to test your server in seconds directly from the terminal.
        </p>

        <section className="space-y-16">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
               Commands & Usage
            </h2>
            <div className="space-y-4">
               {commands.map((c, i) => (
                 <div key={i} className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/50 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                    <code className="text-brand-secondary font-mono text-sm overflow-hidden whitespace-nowrap text-ellipsis max-w-full italic px-3 bg-black/40 rounded py-2 border border-white/5 w-full md:w-auto">
                       {c.cmd}
                    </code>
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-mono text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.label}
                       </span>
                       <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                          <Copy className="size-4" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 italic underline decoration-brand-primary decoration-4 underline-offset-8">
               Interactive Branding
            </h2>
            <p className="text-muted-foreground leading-relaxed italic mb-8">
               When running the CLI, you'll be greeted with our branded ASCII art and live-scoping process steps.
            </p>
            <div className="rounded-3xl border border-white/10 bg-[#000] p-12 font-mono text-[0.4rem] md:text-xs text-brand-primary flex flex-col gap-8 premium-shadow">
               <pre>
{`███╗   ███╗ ██████╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
██╔████╔██║██║     ██████╔╝██████╔╝██████╔╝██║   ██║██████╔╝█████╗  
██║╚██╔╝██║██║     ██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██╔══╝  
██║ ╚═╝ ██║╚██████╗██║     ██║     ██║  ██║╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`}
               </pre>
               <div className="text-brand-secondary">
                  probe any mcp server · tools · compat · score · configs
               </div>
               <div className="space-y-2 opacity-50">
                  <div>Probing https://github.com/example/mcp-server...</div>
                  <div className="flex items-center gap-2">
                     <span className="text-brand-secondary">✔</span> Discovered 12 tools
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-brand-secondary">✔</span> Calculated compat matrix
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
