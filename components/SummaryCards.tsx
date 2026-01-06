'use client'

import { useState } from 'react'
import type { Transaction } from '@/types'
import AIInsightsModal from './AIInsightsModal'

type SummaryCardsProps = {
  weeklyTransactions: Transaction[]
  monthlyTransactions: Transaction[]
  view?: 'weekly' | 'monthly'
}

export default function SummaryCards({
  weeklyTransactions,
  monthlyTransactions,
  view = 'monthly',
}: SummaryCardsProps) {
  const [showAIInsights, setShowAIInsights] = useState(false)

  const calculateSummary = (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

    return {
      income,
      expenses,
      net: income - expenses,
    }
  }

  const currentPeriodTransactions = view === 'weekly' ? weeklyTransactions : monthlyTransactions
  const summary = calculateSummary(currentPeriodTransactions)
  const periodLabel = view === 'weekly' ? 'This Week' : 'This Month'

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${summary.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                ${summary.expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net</p>
              <p className={`text-2xl font-bold mt-2 ${
                summary.net >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                ${summary.net >= 0 ? '+' : ''}${summary.net.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              summary.net >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className="text-2xl">{summary.net >= 0 ? '💰' : '⚠️'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Get AI-Powered Insights</h3>
            <p className="text-blue-100">
              Analyze your spending habits and get personalized recommendations
            </p>
          </div>
          <button
            onClick={() => setShowAIInsights(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Insights
          </button>
        </div>
      </div>

      {showAIInsights && (
        <AIInsightsModal
          transactions={currentPeriodTransactions}
          period={view}
          onClose={() => setShowAIInsights(false)}
          onPeriodChange={() => {}} // Period is controlled by the main navigator now
        />
      )}
    </>
  )
}
