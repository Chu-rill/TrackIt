'use client'

import { useState } from 'react'
import type { Transaction } from '@/types'
import AIInsightsModal from './AIInsightsModal'

type SummaryCardsProps = {
  weeklyTransactions: Transaction[]
  monthlyTransactions: Transaction[]
}

export default function SummaryCards({
  weeklyTransactions,
  monthlyTransactions,
}: SummaryCardsProps) {
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly')

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

  const weekly = calculateSummary(weeklyTransactions)
  const monthly = calculateSummary(monthlyTransactions)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${weekly.income.toFixed(2)}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                ${weekly.expenses.toFixed(2)}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${monthly.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                ${monthly.expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <span className="text-2xl">💸</span>
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
          transactions={period === 'weekly' ? weeklyTransactions : monthlyTransactions}
          period={period}
          onClose={() => setShowAIInsights(false)}
          onPeriodChange={setPeriod}
        />
      )}
    </>
  )
}
