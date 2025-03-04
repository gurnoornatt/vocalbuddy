import { Resend } from 'resend';
import WaitlistConfirmationEmail from '../emails/waitlist-confirmation';

// Helper function for structured logging
function logInfo(message: string, data?: any) {
  console.log(`[Email Service] ${message}`, data ? data : '');
}

function logError(message: string, error: any) {
  console.error(`[Email Service ERROR] ${message}`, error);
}

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  logError('RESEND_API_KEY is not defined in environment variables', null);
} else {
  logInfo('Resend API key configured', { keyLength: resendApiKey.length, keyPrefix: resendApiKey.substring(0, 3) });
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
  const emailId = crypto.randomUUID();
  const startTime = Date.now();
  logInfo(`Preparing to send waitlist confirmation email [${emailId}]`, { email, position });
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://speechbuddy.app';
  const referralUrl = `${baseUrl}/waitlist?ref=${referralCode}`;
  
  logInfo(`Using base URL: ${baseUrl} [${emailId}]`);

  try {
    if (!resendApiKey) {
      logError(`Skipping email send - RESEND_API_KEY not configured [${emailId}]`, null);
      return { success: false, error: 'Email service not configured', emailId };
    }

    logInfo(`Rendering email template [${emailId}]`, { 
      template: 'WaitlistConfirmationEmail',
      recipient: email,
      referralUrl
    });
    
    const emailProps = {
      name,
      position,
      referralCode,
      referralCount,
      referralUrl,
    };
    
    logInfo(`Sending email via Resend [${emailId}]`);
    const { data, error } = await resend.emails.send({
      from: 'SpeechBuddy <waitlist@speechbuddy.app>',
      to: email,
      subject: `You're on the SpeechBuddy waitlist! Position #${position}`,
      react: WaitlistConfirmationEmail(emailProps),
    });

    if (error) {
      logError(`Failed to send email [${emailId}]: ${error.message}`, { 
        error: JSON.stringify(error)
      });
      return { success: false, error: `Failed to send email: ${error.message}`, emailId };
    }

    const responseTime = Date.now() - startTime;
    logInfo(`Email sent successfully [${emailId}] in ${responseTime}ms`, { messageId: data?.id });
    return { success: true, messageId: data?.id, emailId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Error sending email [${emailId}]: ${errorMessage}`, { 
      stack: error instanceof Error ? error.stack : undefined
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      emailId
    };
  }
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  logInfo(`Generated verification code`, { codeLength: code.length });
  return code;
} 