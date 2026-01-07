# Database Migrations

This directory contains SQL migration files for the TrackIt database.

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file (e.g., `001_add_monthly_balances.sql`)
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Available Migrations

### 001_add_monthly_balances.sql

**Purpose**: Adds support for monthly balance carryover feature

**What it does**:
- Creates the `monthly_balances` table to track opening/closing balances for each month
- Adds necessary indexes for performance
- Sets up Row Level Security (RLS) policies
- Creates triggers for automatic timestamp updates

**When to apply**: This migration should be applied before using the balance carryover feature

## Important Notes

- Migrations should be applied in order (001, 002, 003, etc.)
- The main schema file (`supabase-schema.sql`) contains the complete schema including all migrations
- For fresh installations, you can run the entire `supabase-schema.sql` file instead of individual migrations
