import { Resend } from 'resend';

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
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  logInfo(`Generated verification code`, { codeLength: code.length });
  return code;
} 