import { createClient } from '@/lib/supabase/server'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import SummaryCards from '@/components/SummaryCards'
import Header from '@/components/Header'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false })
    .limit(10)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user?.id)
    .order('name')

  // Calculate weekly summary
  const now = new Date()
  const weekStart = startOfWeek(now).toISOString().split('T')[0]
  const weekEnd = endOfWeek(now).toISOString().split('T')[0]

  const { data: weeklyTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  // Calculate monthly summary
  const monthStart = startOfMonth(now).toISOString().split('T')[0]
  const monthEnd = endOfMonth(now).toISOString().split('T')[0]

  const { data: monthlyTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userEmail={user?.email || ''} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your income and expenses
          </p>
        </div>

        <SummaryCards
          weeklyTransactions={weeklyTransactions || []}
          monthlyTransactions={monthlyTransactions || []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <TransactionForm categories={categories || []} />
          </div>

          <div className="lg:col-span-2">
            <TransactionList
              initialTransactions={transactions || []}
              categories={categories || []}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
