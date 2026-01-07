-- Migration: Add monthly_balances table for balance carryover feature
-- Description: This migration adds support for tracking monthly balances that carry over from month to month

-- Monthly Balances table for tracking carryover balances
CREATE TABLE IF NOT EXISTS monthly_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, period_start)
);

-- Indexes for monthly_balances
CREATE INDEX IF NOT EXISTS monthly_balances_user_id_idx ON monthly_balances(user_id);
CREATE INDEX IF NOT EXISTS monthly_balances_period_start_idx ON monthly_balances(period_start);
CREATE INDEX IF NOT EXISTS monthly_balances_user_period_idx ON monthly_balances(user_id, period_start);

-- Enable RLS for monthly_balances
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- Monthly Balances RLS Policies
CREATE POLICY "Users can view their own monthly balances"
  ON monthly_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly balances"
  ON monthly_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly balances"
  ON monthly_balances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly balances"
  ON monthly_balances FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at for monthly_balances
CREATE TRIGGER update_monthly_balances_updated_at
  BEFORE UPDATE ON monthly_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
