export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  created_at: string
  updated_at: string
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>

export type Category = {
  id: string
  user_id: string
  name: string
  type: TransactionType
  icon?: string
  created_at: string
}

export type Period = 'weekly' | 'monthly'

export type Summary = {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  categoryBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}

export type AIInsight = {
  summary: string
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}
