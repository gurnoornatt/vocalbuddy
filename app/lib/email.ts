import { Resend } from 'resend';
import WaitlistConfirmationEmail from '../emails/waitlist-confirmation';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not defined in environment variables');
}
const resend = new Resend(resendApiKey || '');

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail({
  email,
  name,
  position,
  referralCode,
  referralCount = 0,
}: {
  email: string;
  name?: string;
  position: number;
  referralCode: string;
  referralCount?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://speechbuddy.app';
  const referralUrl = `${baseUrl}/waitlist?ref=${referralCode}`;

  try {
    if (!resendApiKey) {
      console.warn('Skipping email send - RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'SpeechBuddy <waitlist@speechbuddy.app>',
      to: email,
      subject: `You're on the SpeechBuddy waitlist! Position #${position}`,
      react: WaitlistConfirmationEmail({
        name,
        position,
        referralCode,
        referralCount,
        referralUrl,
      }),
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    // Return error instead of throwing to prevent API route failure
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
} 