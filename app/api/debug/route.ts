import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  try {
    // Check environment variables (mask sensitive values)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
    };

    // Test Supabase connection
    let supabaseStatus = 'Unknown';
    let dbVersion = null;
    try {
      const { data, error } = await supabase.from('waitlist').select('count(*)', { count: 'exact', head: true });
      supabaseStatus = error ? `Error: ${error.message}` : 'Connected';
      
      // Get PostgreSQL version
      const { data: versionData } = await supabase.rpc('get_db_version');
      dbVersion = versionData;
    } catch (e) {
      supabaseStatus = `Exception: ${e instanceof Error ? e.message : String(e)}`;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envVars,
      supabase: {
        status: supabaseStatus,
        dbVersion,
      },
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 