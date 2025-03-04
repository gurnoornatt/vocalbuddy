import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { generateReferralCode, isValidEmail } from '@/app/lib/utils';
import { sendWaitlistConfirmationEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, name, referralCode } = await request.json();
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('waitlist')
      .select('id, position, referral_code, referral_count')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
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
      const { data: referrer } = await supabase
        .from('waitlist')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Generate unique referral code
    const newReferralCode = generateReferralCode();

    // Get client IP and user agent for analytics
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Insert new waitlist entry
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
      console.error('Error adding to waitlist:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email
    const emailResult = await sendWaitlistConfirmationEmail({
      email: email.toLowerCase(),
      name,
      position: newUser.position,
      referralCode: newUser.referral_code,
    });

    // Log email status but continue regardless
    if (!emailResult.success) {
      console.warn('Email sending failed:', emailResult.error);
    } else {
      console.log('Confirmation email sent successfully, ID:', emailResult.messageId);
    }

    return NextResponse.json({
      message: 'Successfully joined the waitlist',
      position: newUser.position,
      referralCode: newUser.referral_code,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email || !isValidEmail(email)) {
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

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email not found on waitlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      position: user.position,
      referralCode: user.referral_code,
      referralCount: user.referral_count,
    });
  } catch (error) {
    console.error('Waitlist lookup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 