import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { generateReferralCode, isValidEmail } from '@/app/lib/utils';
import { sendWaitlistConfirmationEmail } from '@/app/lib/email';

// Helper function for structured logging
function logInfo(message: string, data?: any) {
  console.log(`[Waitlist API] ${message}`, data ? data : '');
}

function logError(message: string, error: any) {
  console.error(`[Waitlist API ERROR] ${message}`, error);
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  logInfo(`Processing POST request ${requestId}`);
  
  try {
    const { email, name, referralCode } = await request.json();
    logInfo(`Request data`, { email, name, referralCodeProvided: !!referralCode, requestId });
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      logInfo(`Invalid email format: ${email}`, { requestId });
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    logInfo(`Checking if email already exists: ${email}`, { requestId });
    const { data: existingUser, error: existingUserError } = await supabase
      .from('waitlist')
      .select('id, position, referral_code, referral_count')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      logError(`Error checking existing user: ${existingUserError.message}`, { 
        code: existingUserError.code, 
        details: existingUserError.details,
        requestId
      });
    }

    if (existingUser) {
      logInfo(`User already on waitlist: ${email}`, { 
        position: existingUser.position, 
        referralCount: existingUser.referral_count,
        requestId
      });
      return NextResponse.json({
        message: 'You are already on the waitlist',
        position: existingUser.position,
        referralCode: existingUser.referral_code,
        referralCount: existingUser.referral_count,
      });
    }

    // Get referrer if referral code was provided
    let referrerId = null;
    if (referralCode) {
      logInfo(`Looking up referrer for code: ${referralCode}`, { requestId });
      const { data: referrer, error: referrerError } = await supabase
        .from('waitlist')
        .select('id, email')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrerError) {
        logInfo(`Invalid referral code: ${referralCode}`, { 
          error: referrerError.message,
          requestId
        });
      }
      
      if (referrer) {
        referrerId = referrer.id;
        logInfo(`Found referrer: ${referrer.id}`, { 
          referrerEmail: referrer.email,
          requestId
        });
      }
    }

    // Generate unique referral code
    const newReferralCode = generateReferralCode();
    logInfo(`Generated referral code: ${newReferralCode}`, { requestId });

    // Get client IP and user agent for analytics
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    logInfo(`Client info`, { 
      ip, 
      userAgent: userAgent.substring(0, 50) + '...',
      requestId
    });

    // Insert new waitlist entry
    logInfo(`Inserting new waitlist entry for: ${email}`, { requestId });
    const { data: newUser, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        name,
        referral_code: newReferralCode,
        referrer_id: referrerId,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select('id, position, referral_code')
      .single();

    if (error) {
      logError(`Error adding to waitlist: ${error.message}`, { 
        code: error.code, 
        details: error.details,
        requestId
      });
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    logInfo(`Successfully added to waitlist: ${email}`, { 
      position: newUser.position,
      id: newUser.id,
      requestId
    });

    // Send confirmation email
    logInfo(`Sending confirmation email to: ${email}`, { requestId });
    const emailResult = await sendWaitlistConfirmationEmail({
      email: email.toLowerCase(),
      name,
      position: newUser.position,
      referralCode: newUser.referral_code,
    });

    // Log email status but continue regardless
    if (!emailResult.success) {
      logError(`Email sending failed: ${emailResult.error}`, { requestId });
    } else {
      logInfo(`Confirmation email sent successfully, ID: ${emailResult.messageId}`, { requestId });
    }

    const responseTime = Date.now() - startTime;
    logInfo(`Request ${requestId} completed in ${responseTime}ms`);

    return NextResponse.json({
      message: 'Successfully joined the waitlist',
      position: newUser.position,
      referralCode: newUser.referral_code,
      emailSent: emailResult.success,
      requestId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Waitlist error: ${errorMessage}`, { 
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred', requestId },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  logInfo(`Processing GET request ${requestId}`);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    logInfo(`Looking up waitlist status for: ${email}`, { requestId });
    
    if (!email || !isValidEmail(email)) {
      logInfo(`Invalid email format: ${email}`, { requestId });
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Get user's waitlist position
    const { data: user, error } = await supabase
      .from('waitlist')
      .select('position, referral_code, referral_count')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logInfo(`Email not found on waitlist: ${email}`, { requestId });
      } else {
        logError(`Error looking up waitlist status: ${error.message}`, { 
          code: error.code, 
          details: error.details,
          requestId
        });
      }
      
      return NextResponse.json(
        { error: 'Email not found on waitlist', requestId },
        { status: 404 }
      );
    }

    logInfo(`Found waitlist entry for: ${email}`, { 
      position: user.position,
      referralCount: user.referral_count,
      requestId
    });

    const responseTime = Date.now() - startTime;
    logInfo(`Request ${requestId} completed in ${responseTime}ms`);

    return NextResponse.json({
      position: user.position,
      referralCode: user.referral_code,
      referralCount: user.referral_count,
      requestId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Waitlist lookup error: ${errorMessage}`, { 
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred', requestId },
      { status: 500 }
    );
  }
} 