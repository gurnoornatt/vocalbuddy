import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Column,
  Row,
} from '@react-email/components';

interface WaitlistConfirmationEmailProps {
  name?: string;
  position: number;
  referralCode: string;
  referralCount?: number;
  referralUrl: string;
}

export const WaitlistConfirmationEmail = ({
  name = '',
  position,
  referralCode,
  referralCount = 0,
  referralUrl,
}: WaitlistConfirmationEmailProps) => {
  const formattedPosition = position.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  
  return (
    <Html>
      <Head />
      <Preview>You're on the SpeechBuddy waitlist! Position #{formattedPosition}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://lottie.host/5c808e54-c571-465d-b8f2-35efddd7a5e8/rQz8RiplFt.lottie"
            width="120"
            height="120"
            alt="SpeechBuddy Tiger"
            style={logo}
          />
          <Heading style={heading}>Welcome to the SpeechBuddy Waitlist!</Heading>
          <Section style={section}>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Thank you for joining the SpeechBuddy waitlist! You're currently in position <strong>#{formattedPosition}</strong>.
            </Text>
            
            <Text style={text}>
              SpeechBuddy is the fun and interactive way for children to improve their speech and communication skills. Our friendly tiger buddy provides a supportive environment for practice and growth.
            </Text>

            <Section style={ctaSection}>
              <Heading as="h2" style={subheading}>Skip the line!</Heading>
              <Text style={text}>
                Want to get access sooner? Invite your friends and family to join the waitlist using your unique referral link:
              </Text>
              
              <Section style={referralBox}>
                <Text style={referralText}>{referralUrl}</Text>
              </Section>
              
              <Button style={button} href={referralUrl}>
                Share Your Referral Link
              </Button>
            </Section>

            <Hr style={hr} />
            
            <Section>
              <Heading as="h3" style={smallHeading}>How referrals work:</Heading>
              <Text style={text}>
                • For every 3 people who join using your link, you'll move up 100 spots!<br />
                • The top 50 referrers will get early access and special rewards<br />
                • Your unique referral code: <strong>{referralCode}</strong>
              </Text>
            </Section>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 SpeechBuddy, All Rights Reserved
            </Text>
            <Text style={footerText}>
              Our mailing address: 123 Speech Lane, San Francisco, CA 94103
            </Text>
            <Text style={footerText}>
              <Link href="#" style={link}>Privacy Policy</Link> • 
              <Link href="#" style={link}> Terms of Service</Link> • 
              <Link href="#" style={link}> Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f5f8fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '20px',
};

const logo = {
  margin: '0 auto 20px',
  display: 'block',
};

const heading = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const subheading = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '15px 0',
};

const smallHeading = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '15px 0 10px',
};

const section = {
  padding: '0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#5b21b6',
  borderRadius: '4px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '20px auto',
};

const ctaSection = {
  backgroundColor: '#f9f5ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
};

const referralBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '4px',
  padding: '12px',
  margin: '15px 0',
};

const referralText = {
  color: '#5b21b6',
  fontSize: '14px',
  fontWeight: 'medium',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e6ebf1',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '8px 0',
};

const link = {
  color: '#5b21b6',
  textDecoration: 'underline',
}; 