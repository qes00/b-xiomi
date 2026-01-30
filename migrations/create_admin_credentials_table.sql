-- Create admin_credentials table for storing encrypted credentials
-- This table stores API keys, tokens, and other sensitive credentials in encrypted form

CREATE TABLE IF NOT EXISTS admin_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    encrypted_value TEXT NOT NULL,
    credential_type VARCHAR(50) NOT NULL CHECK (credential_type IN ('api_key', 'token', 'password', 'other')),
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_name ON admin_credentials(name);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_type ON admin_credentials(credential_type);

-- Enable Row Level Security
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read credentials
CREATE POLICY "Admins can view credentials"
    ON admin_credentials
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Policy: Only admins can insert credentials
CREATE POLICY "Admins can insert credentials"
    ON admin_credentials
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Policy: Only admins can update credentials
CREATE POLICY "Admins can update credentials"
    ON admin_credentials
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Policy: Only admins can delete credentials
CREATE POLICY "Admins can delete credentials"
    ON admin_credentials
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_credentials_updated_at
    BEFORE UPDATE ON admin_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_credentials_updated_at();

-- Add comment to table
COMMENT ON TABLE admin_credentials IS 'Stores encrypted credentials for admin use (API keys, tokens, passwords)';
COMMENT ON COLUMN admin_credentials.encrypted_value IS 'AES-256 encrypted value using crypto-js';
COMMENT ON COLUMN admin_credentials.credential_type IS 'Type of credential: api_key, token, password, or other';
