import Link from "next/link";
import { BookOpen, Terminal, Code2, Zap, ShieldCheck, ChevronRight } from "lucide-react";

const DOCS_LINKS = [
  { href: "/docs", label: "Introduction", icon: <BookOpen className="size-4" /> },
  { href: "/docs/cli", label: "CLI Guide", icon: <Terminal className="size-4" /> },
  { href: "/docs/api", label: "API Reference", icon: <Code2 className="size-4" /> },
  { href: "/docs/scoring", label: "Scoring Matrix", icon: <Zap className="size-4" /> },
  { href: "/docs/compatibility", label: "Compat Rules", icon: <ShieldCheck className="size-4" /> },
];

export default function DocsSidebar() {
  return (
    <aside className="w-full md:w-64 flex flex-col gap-8 pr-12 border-b md:border-b-0 md:border-r border-white/5 pb-12 md:pb-0">
      <div className="font-bold flex items-center gap-2 text-brand-primary uppercase tracking-widest text-sm italic">
         Documentation
      </div>
      
      <nav className="flex flex-col gap-2">
         {DOCS_LINKS.map((link) => (
           <Link 
             key={link.href} 
             href={link.href}
             className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-muted-foreground hover:text-white group"
           >
             <div className="flex items-center gap-3">
               {link.icon}
               <span className="font-medium text-sm">{link.label}</span>
             </div>
             <ChevronRight className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
           </Link>
         ))}
      </nav>
      
      <div className="mt-auto p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-xs text-muted-foreground leading-relaxed italic">
         Need help? Join our community or open an issue on GitHub.
      </div>
    </aside>
  );
}
