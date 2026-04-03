-- Payments table for transaction records.

CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  midtrans_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = payments.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );
