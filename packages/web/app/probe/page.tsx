"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Circle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ProbeStatus = "idle" | "fetching" | "detecting" | "connecting" | "discovering" | "done" | "error";

interface Step {
  id: ProbeStatus;
  label: string;
}

const STEPS: Step[] = [
  { id: "fetching", label: "Fetching repository metadata..." },
  { id: "detecting", label: "Detecting server transport..." },
  { id: "connecting", label: "Connecting to MCP server..." },
  { id: "discovering", label: "Discovering available tools..." },
];

export default function ProbePage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-2xl px-6 py-20 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="size-12 text-brand-primary animate-spin mb-4" />
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Warming engine...</p>
      </div>
    }>
      <ProbeContent />
    </Suspense>
  );
}

import { Suspense } from "react";

function ProbeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState<ProbeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (initialUrl && status === "idle") {
      startProbe(initialUrl);
    }
  }, [initialUrl]);

  const startProbe = async (targetUrl: string) => {
    if (!targetUrl) return;
    
    setStatus("fetching");
    setError(null);
    setElapsed(0);
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    try {
      const response = await fetch("/api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to probe server");
      }

      const data = await response.json();
      setStatus("done");
      clearInterval(timer);
      router.push(`/probe/${data.id}`);
    } catch (err) {
      clearInterval(timer);
      setStatus("error");
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const getStepStatus = (stepId: ProbeStatus) => {
    const statusOrder: ProbeStatus[] = ["fetching", "detecting", "connecting", "discovering", "done"];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    if (status === "error") return "error";
    if (stepIndex < currentIndex || status === "done") return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full max-w-2xl px-6 py-20 flex flex-col">
      <Link href="/" className="mb-12 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back to portal
      </Link>

      <h1 className="text-4xl font-bold mb-2">Probing Server</h1>
      <p className="text-muted-foreground font-mono truncate mb-12">{url || "Waiting for input..."}</p>

      <div className="space-y-6">
        {STEPS.map((step) => {
          const stepStatus = getStepStatus(step.id);
          return (
            <div 
              key={step.id}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500 ${
                stepStatus === "current" 
                  ? "bg-brand-primary/10 border-brand-primary/30 scale-105" 
                  : stepStatus === "completed"
                  ? "bg-brand-secondary/5 border-brand-secondary/20"
                  : "bg-white/5 border-white/10 opacity-50"
              }`}
            >
              {stepStatus === "current" ? (
                <Loader2 className="size-6 text-brand-primary animate-spin" />
              ) : stepStatus === "completed" ? (
                <CheckCircle2 className="size-6 text-brand-secondary" />
              ) : stepStatus === "error" ? (
                <AlertCircle className="size-6 text-destructive" />
              ) : (
                <Circle className="size-6 text-muted-foreground" />
              )}
              
              <span className={`font-medium ${stepStatus === "current" ? "text-brand-primary" : ""}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === "done" && (
        <div className="mt-12 p-4 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-center animate-bounce">
          ✔ Probe successful! Redirecting to report...
        </div>
      )}

      {status === "error" && (
        <div className="mt-12 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="size-5" />
            Probe Failed
          </div>
          <p className="text-sm opacity-80">{error}</p>
          <button 
            onClick={() => startProbe(url)}
            className="mt-4 text-xs font-bold underline text-left w-fit"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-auto pt-20 flex justify-center text-sm font-mono text-muted-foreground">
        Elapsed: {elapsed.toFixed(1)}s
      </div>
    </div>
  );
}

