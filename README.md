# TrackIt - Expense Tracker with AI Insights

A modern, real-time expense tracking application built with Next.js, Supabase, and AI-powered financial insights using Google's Gemini AI.

## Features

### Core Functionality

- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Transaction Management**: Log income and expenses with categories and descriptions
- **Real-time Updates**: Live transaction updates using Supabase subscriptions
- **Period Navigation**: View and analyze transactions by week or month
- **Category Management**: Automatic default categories for new users with customizable icons

### AI-Powered Insights

- **Flexible Time Periods**: Get AI insights for this week, this month, or any custom date range
- **Personalized Analysis**: Receive tailored financial summaries, strengths, areas for improvement, and recommendations
- **Smart Recommendations**: AI analyzes spending patterns and category breakdowns to provide actionable advice

### User Interface

- **Responsive Design**: Beautiful, mobile-friendly UI built with Tailwind CSS
- **Loading States**: Smooth loading indicators for better UX
- **Financial Dashboard**: Comprehensive summary cards showing income, expenses, and net amount

## Tech Stack

- **Frontend**: Next.js 16.1.1 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Real-time**: Supabase Realtime subscriptions
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Google AI API key (for Gemini)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd TrackIt
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

   - `categories` table with RLS policies
   - `transactions` table with RLS policies
   - Automatic default categories for new users (function and trigger)
   - Proper indexes for performance

5. Enable Realtime:
   - Go to **Database** > **Replication** in your Supabase dashboard
   - Enable replication for the `transactions` table
   - This enables real-time updates in the application

### 4. Configure environment variables

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials:

   - Go to your Supabase project **Settings** > **API**
   - Copy the **Project URL** and **anon/public key**

3. Add your Google AI API key:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-google-ai-key-here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Getting Started

1. **Sign Up**: Create a new account on the signup page
2. **Automatic Setup**: Default income and expense categories are automatically created for your account

### Managing Transactions

1. **Add Transactions**: Use the transaction form to log income or expenses
2. **Select Category**: Choose from predefined categories or create custom ones
3. **Add Details**: Include amount, description, and date
4. **Real-time Updates**: See your transactions appear immediately without page refresh

### Viewing Your Finances

1. **Period Navigation**: Switch between weekly and monthly views
2. **Navigate Time**: Use the period navigator to view past or future periods
3. **Summary Cards**: See at-a-glance totals for income, expenses, and net amount
4. **Transaction List**: View detailed transaction history for the selected period

### AI Insights

1. **Open Insights Modal**: Click "Get Insights" button on the dashboard
2. **Select Time Period**:
   - Choose "This Week" for current week analysis
   - Choose "This Month" for current month analysis
   - Choose "Custom Range" to select any date range
3. **View Analysis**: Review AI-generated insights including:
   - Financial summary of your situation
   - Spending strengths
   - Areas for improvement
   - Actionable recommendations
4. **Change Periods**: Switch between different time periods to see how your spending patterns change

## Database Schema

### Categories Table

| Column     | Type      | Description               |
| ---------- | --------- | ------------------------- |
| id         | UUID      | Primary key               |
| user_id    | UUID      | Foreign key to auth.users |
| name       | TEXT      | Category name             |
| type       | TEXT      | 'income' or 'expense'     |
| icon       | TEXT      | Emoji icon (optional)     |
| created_at | TIMESTAMP | Creation timestamp        |

### Transactions Table

| Column      | Type          | Description               |
| ----------- | ------------- | ------------------------- |
| id          | UUID          | Primary key               |
| user_id     | UUID          | Foreign key to auth.users |
| type        | TEXT          | 'income' or 'expense'     |
| amount      | DECIMAL(12,2) | Transaction amount        |
| category    | TEXT          | Category name             |
| description | TEXT          | Optional description      |
| date        | DATE          | Transaction date          |
| created_at  | TIMESTAMP     | Creation timestamp        |
| updated_at  | TIMESTAMP     | Last update timestamp     |

## Security

- **Row Level Security (RLS)**: All database tables use RLS policies to ensure data isolation
- **User Data Isolation**: Users can only access and modify their own transactions and categories
- **Secure Authentication**: Supabase Auth handles user authentication with industry-standard security
- **API Key Protection**: Sensitive API keys stored in environment variables, never exposed to client
- **Server-side AI Processing**: AI insights generated server-side to protect API keys

## Key Features Implementation

### Real-time Updates

The application uses Supabase Realtime subscriptions to provide instant updates:

- New transactions appear immediately without refresh
- Updates and deletions sync across all open tabs
- Automatic recomputation of summaries and totals

### Period Navigation

- Navigate through weekly or monthly periods
- Jump to today's period with one click
- Previous/Next navigation for time travel
- Automatic filtering of transactions by date

### AI Integration

- Powered by Google's Gemini 2.5 Flash model
- Generates context-aware financial insights
- Analyzes spending patterns and category distributions
- Provides personalized, actionable recommendations
- Supports custom date ranges for flexible analysis

## API Routes

The application includes the following API endpoints:

### `/api/ai-insights` (POST)

Generates AI-powered financial insights based on transaction data.

**Request Body:**

```json
{
  "transactions": Transaction[],
  "period": "weekly" | "monthly" | "custom period"
}
```

**Response:**

```json
{
  "insights": {
    "summary": "string",
    "strengths": ["string"],
    "improvements": ["string"],
    "recommendations": ["string"]
  }
}
```

## Development

### Project Structure

```
TrackIt/
├── app/
│   ├── api/
│   │   └── ai-insights/
│   │       └── route.ts          # AI insights API endpoint
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   └── layout.tsx
├── components/
│   ├── AIInsightsModal.tsx       # AI insights modal with period selection
│   ├── DashboardClient.tsx       # Main dashboard client component
│   ├── PeriodNavigator.tsx       # Week/month navigation
│   ├── SummaryCards.tsx          # Income/expense/net summary cards
│   ├── TransactionForm.tsx       # Add transaction form
│   └── TransactionList.tsx       # Transaction list display
├── lib/
│   └── supabase/
│       ├── client.ts             # Supabase client config
│       └── server.ts             # Supabase server config
├── types/
│   └── index.ts                  # TypeScript type definitions
├── supabase-schema.sql           # Database schema
└── .env.local.example            # Environment variables template
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### AI Insights Not Working

- Verify your `GEMINI_API_KEY` is set correctly in `.env.local`
- Check that you're using a valid Google AI API key
- Ensure the API endpoint is accessible (check browser console for errors)

### Real-time Updates Not Working

- Ensure Realtime is enabled for the `transactions` table in Supabase
- Check browser console for subscription errors
- Verify your Supabase project has Realtime enabled (available on all plans)

### Authentication Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that email confirmation is disabled in Supabase Auth settings (for development)
- Clear browser cookies and try again

### Database Issues

- Ensure you've run the complete `supabase-schema.sql` file
- Verify RLS policies are enabled on both tables
- Check that the trigger for default categories is working

## Future Enhancements

- Budget setting and tracking with alerts
- Advanced data visualization with interactive charts
- Export transactions to CSV/Excel
- Recurring transaction templates
- Multi-currency support with exchange rates
- Receipt image upload and OCR
- Spending goals and progress tracking
- Mobile app (React Native)
- Bank account integration
- Shared household budgets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
