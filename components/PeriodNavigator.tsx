'use client'

import { format } from 'date-fns'

type PeriodNavigatorProps = {
  view: 'weekly' | 'monthly'
  currentDate: Date
  onViewChange: (view: 'weekly' | 'monthly') => void
  onPreviousPeriod: () => void
  onNextPeriod: () => void
  onToday: () => void
}

export default function PeriodNavigator({
  view,
  currentDate,
  onViewChange,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
}: PeriodNavigatorProps) {
  const getPeriodLabel = () => {
    if (view === 'weekly') {
      return `Week of ${format(currentDate, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  const isCurrentPeriod = () => {
    const now = new Date()
    if (view === 'weekly') {
      // Check if current date is in the same week as now
      const currentWeekStart = new Date(currentDate)
      currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay())
      const nowWeekStart = new Date(now)
      nowWeekStart.setDate(now.getDate() - now.getDay())
      return currentWeekStart.getTime() === nowWeekStart.getTime()
    } else {
      // Check if current date is in the same month as now
      return (
        currentDate.getMonth() === now.getMonth() &&
        currentDate.getFullYear() === now.getFullYear()
      )
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewChange('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Period Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousPeriod}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Previous period"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center min-w-[200px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPeriodLabel()}
            </h3>
          </div>

          <button
            onClick={onNextPeriod}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Next period"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Today Button */}
        {!isCurrentPeriod() && (
          <button
            onClick={onToday}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            Today
          </button>
        )}
      </div>
    </div>
  )
}
