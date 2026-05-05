import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, country, emoji')
      .order('name');
    
    if (error) {
      console.error('Destinations fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch destinations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Destinations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
