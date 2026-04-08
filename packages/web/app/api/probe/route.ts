import { NextResponse } from 'next/server';
import { analyzeServer } from '@/lib/probe-engine';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Perform analysis
    // Note: In production, you might want to move this to a background job
    // for long-running analyses, but for v1 we'll do it synchronously.
    const result = await analyzeServer(url);

    // Save to Supabase
    const { data, error } = await supabase
      .from('probes')
      .insert({
        repo_url: result.repo_url,
        repo_name: result.repo_name,
        repo_description: result.repo_description,
        stars: result.stars,
        transport: result.transport,
        tools: result.tools,
        compatibility: result.compatibility,
        score: result.score,
        score_breakdown: result.score_breakdown,
        grade: result.grade,
        status: 'done',
        is_public: true
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error(`Failed to save probe results: ${error.message}`);
    }

    // Update global stats (ignoring errors for stats to unblock main flow)
    try {
      const statsUpdate = {
        total_probes: 1, // We'll increment these in SQL in the real Supabase
        total_tools: JSON.parse(result.tools).length,
        total_configs: 4
      };
      // For simplicity in v1, we assume a single row with ID 1
      await supabase.rpc('increment_probe_stats', { 
        probes_inc: 1, 
        tools_inc: JSON.parse(result.tools).length,
        configs_inc: 4 
      });
    } catch (e) {
      // stats failure shouldn't fail the probe
    }

    return NextResponse.json({ id: data.id, status: 'done' });
  } catch (error) {
    console.error('Probe API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
