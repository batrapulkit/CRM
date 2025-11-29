-- Add Stripe billing fields to agencies table
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled, incomplete
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agencies_stripe_customer_id ON public.agencies(stripe_customer_id);
