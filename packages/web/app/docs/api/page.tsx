import DocsSidebar from "@/components/DocsSidebar";
import { Code2, ArrowRight, Link } from "lucide-react";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/probe",
      description: "Submit a new MCP server for analysis.",
      body: { url: "string" },
      returns: { id: "string", status: "pending/done" }
    },
    {
      method: "GET",
      path: "/api/probe/[id]",
      description: "Retrieve a specific probe report.",
      returns: { 
        repo_name: "string", 
        tools: "Tool[]", 
        score: "number",
        grade: "string"
      }
    },
    {
      method: "GET",
      path: "/api/gallery",
      description: "Query the public database of analyzed servers.",
      query: "?search=&sort=&page=",
      returns: { data: "Probe[]", total: "number" }
    }
  ];

  return (
    <div className="w-full max-w-7xl px-6 py-20 flex flex-col md:flex-row gap-16 min-h-[calc(100vh-100px)]">
      <DocsSidebar />
      <main className="flex-grow max-w-3xl">
        <div className="flex items-center gap-6">
          <Link href="https://github.com/MuhammadUsmanGM" target="_blank" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <svg className="size-6 text-muted-foreground hover:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </Link>
           <Code2 className="size-4 text-brand-primary" />
           <span className="font-mono text-xs uppercase tracking-widest text-brand-primary font-bold italic">Developer API</span>
        </div>
        <h1 className="text-5xl font-black italic mb-8 border-b border-white/5 pb-8">API Reference</h1>
        <p className="text-xl text-muted-foreground italic mb-12 border-l-2 border-brand-primary/20 pl-8">
           Standardized endpoints to programmatically intersect with the MCP fleet.
        </p>

        <section className="space-y-20">
           {endpoints.map((ep, i) => (
             <div key={i} className="group relative">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 rounded-lg bg-brand-primary text-white font-black text-xs uppercase tracking-widest">{ep.method}</span>
                     <code className="text-xl font-bold font-mono text-muted-foreground group-hover:text-white transition-colors">{ep.path}</code>
                  </div>
                </div>
                <p className="text-muted-foreground italic mb-8 max-w-2xl">{ep.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {ep.body && (
                    <div className="space-y-4">
                       <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666]">Request Body</h4>
                       <pre className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-brand-secondary">
{JSON.stringify(ep.body, null, 2)}
                       </pre>
                    </div>
                  )}
                  <div className="space-y-4">
                     <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666]">Response</h4>
                      <pre className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-brand-secondary">
{JSON.stringify(ep.returns, null, 2)}
                      </pre>
                  </div>
                </div>
             </div>
           ))}
        </section>
      </main>
    </div>
  );
}
