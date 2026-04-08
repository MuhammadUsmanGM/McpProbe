import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RepoMetadata, ProbeResult, Tool, CompatEntry, ScoreBreakdown } from "@/lib/types";
import { 
  Star, GitBranch, Terminal, Layers, ShieldCheck, Zap, 
  Settings, Download, Share2, RefreshCcw, ArrowLeft,
  CheckCircle2, AlertTriangle, XCircle, Copy
} from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  repo_url: string;
  repo_name: string;
  repo_description: string;
  stars: number;
  transport: string;
  tools: any[];
  compatibility: CompatEntry[];
  score: number;
  score_breakdown: ScoreBreakdown[];
  grade: string;
  probed_at: string;
}

async function getProbeReport(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('probes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  
  return {
    ...data,
    tools: JSON.parse(data.tools || '[]'),
    compatibility: JSON.parse(data.compatibility || '[]'),
    score_breakdown: JSON.parse(data.score_breakdown || '[]')
  };
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await getProbeReport(params.id);

  if (!report) notFound();

  const sections = [
    { id: 'tools', label: 'Tools', icon: <Layers className="size-4" />, count: report.tools.length },
    { id: 'compat', label: 'Compatibility', icon: <ShieldCheck className="size-4" /> },
    { id: 'score', label: 'Health Score', icon: <Zap className="size-4" />, extra: `${report.score}/100` },
    { id: 'config', label: 'Client Configs', icon: <Settings className="size-4" /> },
  ];

  return (
    <div className="w-full max-w-5xl px-6 py-12 md:py-20 flex flex-col items-center">
      {/* Header / Meta */}
      <section className="w-full flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
        <div className="flex-grow">
          <Link href="/" className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group text-sm font-mono uppercase tracking-widest">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Probe Portal
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-black tracking-tight">{report.repo_name}</h1>
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
              report.transport === 'stdio' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary'
            }`}>
              {report.transport}
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl border-l-2 border-white/10 pl-6">
            {report.repo_description || "No repository description provided."}
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm font-mono text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-yellow-500/50" />
              {report.stars.toLocaleString()} Stars
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="size-4" />
              Probed {new Date(report.probed_at).toLocaleDateString()}
            </div>
            <Link href={report.repo_url} target="_blank" className="flex items-center gap-2 hover:text-white transition-colors underline underline-offset-4">
              GitHub Repo
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button className="w-full md:w-48 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Download className="size-4" />
            Download
          </button>
          <button className="w-full md:w-48 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all premium-shadow">
            <Share2 className="size-4" />
            Share Report
          </button>
        </div>
      </section>

      {/* Main Report Navigation (Placeholder for now, using cards below) */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Score & Compat */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Score Card */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-brand-primary/10 blur-3xl rounded-full" />
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Zap className="size-4 text-brand-primary" />
              Health Score
            </h3>
            
            <div className="relative mb-8">
              <div className="text-7xl font-black italic">{report.score}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase">Grade: {report.grade}</div>
            </div>

            <div className="space-y-4">
              {report.score_breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {b.passed ? <CheckCircle2 className="size-4 text-brand-secondary" /> : <AlertTriangle className="size-4 text-yellow-500" />}
                    {b.label}
                  </div>
                  <div className="font-mono">{b.earnedPoints}/{b.maxPoints}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compat Card */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
             <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-secondary" />
              AI Compatibility
            </h3>
            <div className="space-y-4">
              {report.compatibility.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="font-bold">{c.client}</div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    c.status === 'ready' ? 'bg-brand-secondary/20 text-brand-secondary' : c.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tools & Configs */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Tools List */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Layers className="size-4 text-brand-primary" />
              Discovered Tools ({report.tools.length})
            </h3>
            
            <div className="space-y-6">
              {report.tools.map((tool: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="font-mono text-lg font-bold text-brand-secondary group-hover:underline cursor-pointer">{tool.name}</div>
                    <div className="flex flex-wrap gap-2">
                       {tool.inputs.map((input: any, j: number) => (
                         <span key={j} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-muted-foreground italic">
                           {input.name}:{input.type}
                         </span>
                       ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {tool.description || "No description provided for this tool."}
                  </p>
                </div>
              ))}
              {report.tools.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                   <AlertTriangle className="size-12 mb-4" />
                   No tools discovered in this server.
                </div>
              )}
            </div>
          </div>

          {/* Configs Section */}
          <div className="p-8 rounded-3xl bg-brand-primary/5 border border-brand-primary/20">
             <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Settings className="size-4 text-brand-primary" />
              Generated Configs
            </h3>
            <div className="p-6 rounded-2xl bg-[#010101] border border-white/10 font-mono text-xs overflow-x-auto relative group">
              <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="size-4" />
              </button>
              <pre className="text-brand-secondary leading-relaxed">
{`{
  "mcpServers": {
    "${report.repo_name}": {
      "command": "npx",
      "args": ["-y", "${report.repo_name}"]
    }
  }
}`}
              </pre>
            </div>
            <p className="mt-6 text-xs text-muted-foreground font-mono leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 italic">
               Note: This config is optimized for standard Claude Desktop installs. For local dev mode, run the probe on your local source path via the CLI.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mt-20 flex justify-center">
         <button className="flex items-center gap-2 text-muted-foreground hover:text-white font-bold transition-all group">
            <RefreshCcw className="size-4 group-hover:rotate-180 transition-transform duration-700" />
            Re-probe Fresh Instance
         </button>
      </section>
    </div>
  );
}
