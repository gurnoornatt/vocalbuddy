import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import os from 'os';

// Helper function for structured logging
function logInfo(message: string, data?: any) {
  console.log(`[Debug API] ${message}`, data ? data : '');
}

function logError(message: string, error: any) {
  console.error(`[Debug API ERROR] ${message}`, error);
}

// Define types for table information
interface TableInfo {
  table_name: string;
  table_schema: string;
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  logInfo(`Processing debug request ${requestId}`);
  
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    logInfo(`Rejected debug request in ${process.env.NODE_ENV} environment`, { requestId });
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  try {
    // Check environment variables (mask sensitive values)
    logInfo(`Checking environment variables`, { requestId });
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
    };

    // Get system information
    logInfo(`Gathering system information`, { requestId });
    const systemInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        total: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
        free: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`,
      },
      cpus: os.cpus().length,
      uptime: `${Math.floor(os.uptime() / 3600)} hours`,
    };

    // Test Supabase connection
    logInfo(`Testing Supabase connection`, { requestId });
    let supabaseStatus = 'Unknown';
    let dbVersion = null;
    let waitlistCount = 0;
    let tablesInfo: TableInfo[] = [];
    
    try {
      // Check connection by counting waitlist entries
      const { count, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        supabaseStatus = `Error: ${countError.message}`;
        logError(`Supabase connection error: ${countError.message}`, { 
          code: countError.code,
          requestId
        });
      } else {
        supabaseStatus = 'Connected';
        waitlistCount = count || 0;
        logInfo(`Supabase connected successfully. Waitlist count: ${waitlistCount}`, { requestId });
      }
      
      // Get PostgreSQL version
      const { data: versionData, error: versionError } = await supabase.rpc('get_db_version');
      if (versionError) {
        logError(`Failed to get DB version: ${versionError.message}`, { requestId });
      } else {
        dbVersion = versionData;
        logInfo(`Database version: ${dbVersion}`, { requestId });
      }
      
      // Get table information
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public');
        
      if (tableError) {
        logError(`Failed to get table information: ${tableError.message}`, { requestId });
      } else if (tableData) {
        tablesInfo = tableData as TableInfo[];
        logInfo(`Found ${tableData.length} tables in public schema`, { requestId });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      supabaseStatus = `Exception: ${errorMessage}`;
      logError(`Supabase connection exception: ${errorMessage}`, { 
        stack: e instanceof Error ? e.stack : undefined,
        requestId
      });
    }

    // Get request information
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Only include safe headers
      if (!key.includes('auth') && !key.includes('cookie') && !key.includes('token')) {
        headers[key] = value;
      }
    });

    const responseTime = Date.now() - startTime;
    logInfo(`Debug request ${requestId} completed in ${responseTime}ms`);

    return NextResponse.json({
      requestId,
      timestamp: new Date().toISOString(),
      environment: envVars,
      system: systemInfo,
      supabase: {
        status: supabaseStatus,
        dbVersion,
        waitlistCount,
        tables: tablesInfo,
      },
      request: {
        url: request.url,
        method: request.method,
        headers,
      },
      performance: {
        responseTime: `${responseTime}ms`,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Debug endpoint error: ${errorMessage}`, { 
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: errorMessage,
        requestId,
      },
      { status: 500 }
    );
  }
} 