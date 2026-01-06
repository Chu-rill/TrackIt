'use client'

import { useState, useEffect } from 'react'
import type { Transaction, AIInsight } from '@/types'

type AIInsightsModalProps = {
  transactions: Transaction[]
  period: 'weekly' | 'monthly'
  onClose: () => void
  onPeriodChange: (period: 'weekly' | 'monthly') => void
}

export default function AIInsightsModal({
  transactions,
  period,
  onClose,
  onPeriodChange,
}: AIInsightsModalProps) {
  const [insights, setInsights] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions, period }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [period])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI-Powered Insights
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onPeriodChange('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => onPeriodChange('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          {insights && !loading && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{insights.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {insights.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400 mt-1">⚠</span>
                      <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">💡</span>
                      <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
