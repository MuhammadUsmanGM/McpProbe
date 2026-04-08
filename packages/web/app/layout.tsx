import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCPProbe — Probe any MCP server in seconds",
  description: "Dissect any Model Context Protocol (MCP) server. Analyze tools, check compatibility with AI clients, and get health scores instantly.",
  keywords: ["MCP", "Model Context Protocol", "AI", "Claude", "Cursor", "Windsurf", "Cline", "Developer Tools"],
  authors: [{ name: "Muhammad Usman" }],
  openGraph: {
    title: "MCPProbe — Probe any MCP server in seconds",
    description: "Analyze tools, check compatibility, and get health scores for any MCP server.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPProbe — Probe any MCP server in seconds",
    description: "The ultimate analyzer for Model Context Protocol (MCP) servers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-primary/20 selection:text-brand-primary font-sans noise-texture">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-background to-background" />

        <main className="relative flex-grow flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
