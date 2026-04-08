import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data || {
      total_probes: 0,
      total_tools: 0,
      total_configs: 0
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
