'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const supabase = createClient()

  useEffect(() => {
    // Test realtime connection
    const channel = supabase
      .channel('connection-test')
      .subscribe((status) => {
        console.log('Realtime connection test:', status)
        if (status === 'SUBSCRIBED') {
          setStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setStatus('error')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Real-time Connected</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-red-300 rounded-full"></div>
        <span className="text-sm font-medium">Real-time Error</span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">Connecting...</span>
    </div>
  )
}
