import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || ''; // compat filter
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const start = (page - 1) * limit;

  try {
    let query = supabase
      .from('probes')
      .select('id, repo_name, repo_description, stars, transport, score, grade, tools, compatibility, probed_at')
      .eq('is_public', true);

    if (search) {
      query = query.ilike('repo_name', `%${search}%`);
    }

    if (filter) {
      // Simplistic filter: client in compatibility list
      query = query.contains('compatibility', [{ client: filter, status: 'ready' }]);
    }

    if (sort === 'score') {
      query = query.order('score', { ascending: false });
    } else if (sort === 'stars') {
      query = query.order('stars', { ascending: false });
    } else {
      query = query.order('probed_at', { ascending: false });
    }

    const { data, error, count } = await query.range(start, start + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data.map(d => ({
        ...d,
        tools_count: JSON.parse(d.tools || '[]').length,
        compatibility_list: JSON.parse(d.compatibility || '[]')
      })),
      total: count,
      page,
      limit
    });
  } catch (error) {
    console.error('Gallery API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
