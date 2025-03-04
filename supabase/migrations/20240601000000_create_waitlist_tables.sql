-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referral_code TEXT UNIQUE NOT NULL,
  referrer_id UUID REFERENCES waitlist(id),
  referral_count INTEGER DEFAULT 0,
  position INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Create email verification table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  is_used BOOLEAN DEFAULT FALSE
);

-- Create function to generate a unique position number
CREATE OR REPLACE FUNCTION generate_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the current max position
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position FROM waitlist;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign position
CREATE TRIGGER set_waitlist_position
BEFORE INSERT ON waitlist
FOR EACH ROW
EXECUTE FUNCTION generate_waitlist_position();

-- Create function to update referrer's count
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referrer_id IS NOT NULL THEN
    UPDATE waitlist
    SET referral_count = referral_count + 1
    WHERE id = NEW.referrer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update referral count
CREATE TRIGGER increment_referral_count
AFTER INSERT ON waitlist
FOR EACH ROW
EXECUTE FUNCTION update_referral_count();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_referral_code_idx ON waitlist(referral_code); 