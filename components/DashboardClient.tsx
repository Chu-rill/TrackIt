'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, Category } from '@/types'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import SummaryCards from './SummaryCards'
import PeriodNavigator from './PeriodNavigator'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths
} from 'date-fns'

type DashboardClientProps = {
  initialTransactions: Transaction[]
  categories: Category[]
  userId: string
}

export default function DashboardClient({
  initialTransactions,
  categories,
  userId,
}: DashboardClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [view, setView] = useState<'weekly' | 'monthly'>('monthly')
  const [currentPeriodDate, setCurrentPeriodDate] = useState(new Date())
  const supabase = createClient()

  // Fetch all transactions for summaries
  useEffect(() => {
    const fetchAllTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (data) {
        setAllTransactions(data)
        setTransactions(data.slice(0, 10))
      }
    }

    fetchAllTransactions()
  }, [userId, supabase])

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription for user:', userId)

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Real-time event received:', payload.eventType, payload)

          if (payload.eventType === 'INSERT') {
            const newTransaction = payload.new as Transaction
            console.log('➕ Adding transaction:', newTransaction)
            setAllTransactions((prev) => {
              const updated = [newTransaction, ...prev].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              console.log('📊 Total transactions now:', updated.length)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Deleting transaction:', payload.old.id)
            setAllTransactions((prev) => prev.filter((t) => t.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Updating transaction:', payload.new.id)
            setAllTransactions((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t))
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to realtime channel')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime subscription timed out')
        }
      })

    return () => {
      console.log('🔌 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Period navigation handlers
  const handlePreviousPeriod = () => {
    if (view === 'weekly') {
      setCurrentPeriodDate(subWeeks(currentPeriodDate, 1))
    } else {
      setCurrentPeriodDate(subMonths(currentPeriodDate, 1))
    }
  }

  const handleNextPeriod = () => {
    if (view === 'weekly') {
      setCurrentPeriodDate(addWeeks(currentPeriodDate, 1))
    } else {
      setCurrentPeriodDate(addMonths(currentPeriodDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentPeriodDate(new Date())
  }

  const handleViewChange = (newView: 'weekly' | 'monthly') => {
    setView(newView)
    setCurrentPeriodDate(new Date()) // Reset to current period when changing view
  }

  // Calculate period interval based on current view and date
  const periodInterval = view === 'weekly'
    ? { start: startOfWeek(currentPeriodDate), end: endOfWeek(currentPeriodDate) }
    : { start: startOfMonth(currentPeriodDate), end: endOfMonth(currentPeriodDate) }

  // Filter transactions for the current period
  const periodTransactions = allTransactions.filter((t) => {
    try {
      const transactionDate = parseISO(t.date.toString())
      return isWithinInterval(transactionDate, periodInterval)
    } catch {
      return false
    }
  })

  // Update transactions list to show period transactions (limited to 10)
  useEffect(() => {
    console.log('🔄 Updating transaction list. Period has', periodTransactions.length, 'transactions')
    setTransactions(periodTransactions.slice(0, 10))
  }, [periodTransactions.length, allTransactions.length, currentPeriodDate, view])

  return (
    <>
      <PeriodNavigator
        view={view}
        currentDate={currentPeriodDate}
        onViewChange={handleViewChange}
        onPreviousPeriod={handlePreviousPeriod}
        onNextPeriod={handleNextPeriod}
        onToday={handleToday}
      />

      <SummaryCards
        weeklyTransactions={view === 'weekly' ? periodTransactions : []}
        monthlyTransactions={view === 'monthly' ? periodTransactions : []}
        view={view}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-1">
          <TransactionForm categories={categories} />
        </div>

        <div className="lg:col-span-2">
          <TransactionList
            initialTransactions={transactions}
            categories={categories}
            title={`Transactions (${periodTransactions.length} total)`}
          />
        </div>
      </div>
    </>
  )
}
