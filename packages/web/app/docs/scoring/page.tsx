import DocsSidebar from "@/components/DocsSidebar";
import { Zap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function ScoringDocsPage() {
  const criteria = [
    { label: "Performance", key: "Latency < 3s", points: 20, desc: "Fast response times ensure AI clients remain interactive." },
    { label: "Documentation", key: "Tool Descriptions", points: 20, desc: "Each tool must have a clear semantic description for LLM reasoning." },
    { label: "Typing", key: "Input Schema Types", points: 15, desc: "Strict JSON Schema types prevent hallucinated tool calls." },
    { label: "Security", key: "No Hardcoded Secrets", points: 20, desc: "Checking for API keys, passwords, or tokens in source/readme." },
    { label: "Setup", key: "Installation Guide", points: 15, desc: "Clear README instructions for npm/stdio configuration." },
    { label: "Robustness", key: "Error Schemas", points: 10, desc: "Explicitly defined error responses for handled failures." }
  ];

  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col md:flex-row gap-16 min-h-[calc(100vh-100px)]">
      <DocsSidebar />
      <main className="flex-grow max-w-3xl">
        <div className="flex items-center gap-3 mb-6 p-2 w-fit bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4">
           <Zap className="size-4 text-brand-primary" />
           <span className="font-mono text-xs uppercase tracking-widest text-brand-primary font-bold italic">Grader Docs</span>
        </div>
        <h1 className="text-5xl font-black italic mb-8 border-b border-white/5 pb-8">Scoring Matrix</h1>
        <p className="text-xl text-muted-foreground italic mb-12 border-l-2 border-brand-primary/20 pl-8">
           We grade MCP servers on a 100-point quality scale. High scores correlate directly with LLM success rates.
        </p>

        <section className="space-y-12">
           <div className="rounded-3xl border border-white/10 bg-white/2 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/5 font-mono text-[10px] uppercase tracking-widest text-[#666] border-b border-white/10">
                       <th className="p-6">Criteria</th>
                       <th className="p-6 text-center">Weight</th>
                       <th className="p-6">Description</th>
                    </tr>
                 </thead>
                 <tbody>
                    {criteria.map((c, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-brand-primary/5 transition-colors">
                         <td className="p-6">
                            <div className="font-bold">{c.label}</div>
                            <div className="text-xs font-mono text-muted-foreground italic">{c.key}</div>
                         </td>
                         <td className="p-6 text-center">
                            <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-mono text-xs font-black">
                               +{c.points}
                            </span>
                         </td>
                         <td className="p-6 text-sm text-muted-foreground italic">
                            {c.desc}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-brand-secondary/5 border border-brand-secondary/20 flex flex-col gap-4">
                 <div className="flex items-center gap-2 font-bold text-brand-secondary italic">
                    <CheckCircle2 className="size-5" />
                    Tier A (80-100)
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                    Production ready. Perfectly documented and highly optimized for Claude Desktop and more.
                 </p>
              </div>
              <div className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20 flex flex-col gap-4">
                 <div className="flex items-center gap-2 font-bold text-destructive italic underline decoration-destructive/30 decoration-4 underline-offset-4">
                    <XCircle className="size-5" />
                    Tier F (0-40)
                 </div>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                    Crucial issues found. Likely has performance bottlenecks or documentation voids preventing LLM usage.
                 </p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
