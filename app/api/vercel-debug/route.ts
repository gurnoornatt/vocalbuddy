import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// This route provides debug information specifically for Vercel deployments
// It is safer than the main debug endpoint as it doesn't expose sensitive information

export async function GET(request: NextRequest) {
  const isVercel = !!process.env.VERCEL;
  const requestId = crypto.randomUUID();
  
  try {
    // Basic environment info (safe to expose)
    const envInfo = {
      platform: isVercel ? 'Vercel' : 'Local/Other',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      region: process.env.VERCEL_REGION,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      // We don't expose actual API keys for security reasons
    };
    
    // Test Supabase connection without exposing sensitive data
    let supabaseStatus = 'unknown';
    let userCount = null;
    
    try {
      // Try a simple query to test the connection
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        supabaseStatus = `Error: ${error.message}`;
      } else {
        supabaseStatus = 'Connected';
        userCount = count;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      supabaseStatus = `Exception: ${errorMessage}`;
    }
    
    // Get deployment information if on Vercel
    const deploymentInfo = isVercel ? {
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ? 
                   process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) : null,
      projectName: process.env.VERCEL_PROJECT_NAME,
    } : null;
    
    // Get request information
    const requestInfo = {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      protocol: request.headers.get('x-forwarded-proto') || 'http',
    };
    
    // Construct response
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      requestId,
      environment: envInfo,
      deployment: deploymentInfo,
      request: requestInfo,
      database: {
        status: supabaseStatus,
        userCount,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        status: 'error', 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        requestId 
      },
      { status: 500 }
    );
  }
} 