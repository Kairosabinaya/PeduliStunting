-- Subscriptions table for premium tier management.

CREATE TYPE subscription_tier AS ENUM ('profesional', 'institusi');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  midtrans_sub_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
