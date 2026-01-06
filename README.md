# Expense Tracker with AI Insights

A modern expense tracking application built with Next.js, Supabase, and AI-powered insights using Anthropic's Claude.

## Features

- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Transaction Tracking**: Log income and expenses with categories and descriptions
- **Weekly & Monthly Summaries**: Comprehensive financial overviews
- **AI-Powered Insights**: Get personalized spending recommendations from Claude AI
- **Category Management**: Automatic default categories for quick tracking
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Anthropic Claude API
- **Charts**: Recharts (optional for future enhancements)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- An Anthropic API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor
4. This will create:
   - `categories` table
   - `transactions` table
   - Row Level Security (RLS) policies
   - Default categories for new users

### 4. Configure environment variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:
   - Go to your Supabase project settings > API
   - Copy the Project URL and anon/public key

3. Add your Anthropic API key:
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Sign Up**: Create a new account on the signup page
2. **Add Transactions**: Use the form to add income or expenses
3. **View Summaries**: See your weekly and monthly financial summaries
4. **Get AI Insights**: Click "Get Insights" to receive personalized recommendations

## Database Schema

### Categories Table

| Column     | Type      | Description                    |
| ---------- | --------- | ------------------------------ |
| id         | UUID      | Primary key                    |
| user_id    | UUID      | Foreign key to auth.users      |
| name       | TEXT      | Category name                  |
| type       | TEXT      | 'income' or 'expense'          |
| icon       | TEXT      | Emoji icon (optional)          |
| created_at | TIMESTAMP | Creation timestamp             |

### Transactions Table

| Column      | Type          | Description                |
| ----------- | ------------- | -------------------------- |
| id          | UUID          | Primary key                |
| user_id     | UUID          | Foreign key to auth.users  |
| type        | TEXT          | 'income' or 'expense'      |
| amount      | DECIMAL(12,2) | Transaction amount         |
| category    | TEXT          | Category name              |
| description | TEXT          | Optional description       |
| date        | DATE          | Transaction date           |
| created_at  | TIMESTAMP     | Creation timestamp         |
| updated_at  | TIMESTAMP     | Last update timestamp      |

## Security

- All tables use Row Level Security (RLS)
- Users can only access their own data
- Authentication handled by Supabase Auth
- API keys stored in environment variables

## Future Enhancements

- Budget setting and tracking
- Data visualization with charts
- Export transactions to CSV
- Recurring transaction templates
- Multi-currency support
- Mobile app (React Native)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
