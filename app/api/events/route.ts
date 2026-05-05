import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateEventMetadata, type EventType } from '@/lib/types/events';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/events - Starting event creation');
    
    const supabase = await createClient();
    
    // Verify supabase client
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('❌ Invalid Supabase client:', { 
        hasClient: !!supabase, 
        hasFrom: supabase && typeof supabase.from,
        clientType: typeof supabase 
      });
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log('📦 Request body received:', { 
      operator_id: body.operator_id, 
      type: body.type, 
      title: body.title 
    });

    const {
      operator_id,
      type,
      title,
      location,
      start_date,
      end_date,
      status = 'upcoming',
      metadata = {},
    } = body;

    // Validate required fields
    if (!operator_id || !type || !title || !location || !start_date || !end_date) {
      console.error('❌ Missing required fields:', { operator_id, type, title, location, start_date, end_date });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes: EventType[] = ['safari', 'marathon', 'tour'];
    if (!validTypes.includes(type)) {
      console.error('❌ Invalid event type:', type);
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate type-specific metadata
    if (!validateEventMetadata(type, metadata)) {
      console.error('❌ Invalid metadata for type:', type);
      return NextResponse.json(
        { error: `Invalid metadata for ${type} event` },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, inserting into database...');

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        operator_id,
        type,
        title,
        location,
        start_date,
        end_date,
        status,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create event', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Event created successfully:', event.id);

    return NextResponse.json({
      data: event,
      message: 'Event created successfully'
    });

  } catch (error: any) {
    console.error('❌ Event creation exception:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/events - Fetching events');
    
    const supabase = await createClient();
    
    // Verify supabase client
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('❌ Invalid Supabase client in GET:', { 
        hasClient: !!supabase, 
        hasFrom: supabase && typeof supabase.from,
        clientType: typeof supabase,
        clientKeys: supabase ? Object.keys(supabase) : []
      });
      return NextResponse.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    const operatorId = searchParams.get('operator_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    console.log('🔍 Query params:', { operatorId, type, status });

    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    if (operatorId) {
      query = query.eq('operator_id', operatorId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('❌ Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Events fetched:', events?.length || 0);

    return NextResponse.json({
      data: events,
      count: events?.length || 0,
    });

  } catch (error: any) {
    console.error('❌ Events fetch exception:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
