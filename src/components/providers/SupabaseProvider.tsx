'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SupabaseContextType {
  isConnected: boolean
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error'
  error?: string
}

const SupabaseContext = createContext<SupabaseContextType>({
  isConnected: false,
  connectionState: 'disconnected',
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SupabaseProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [error, setError] = useState<string>()

  useEffect(() => {
    let mounted = true
    let testChannel: RealtimeChannel | null = null

    const initializeConnection = async () => {
      try {
        setConnectionState('connecting')
        setError(undefined)

        // Test the connection by creating a test channel
        testChannel = supabase.channel('connection-test')
        
        testChannel
          .on('broadcast', { event: 'test' }, () => {
            // Connection test successful
          })
          .subscribe((status) => {
            if (!mounted) return

            switch (status) {
              case 'SUBSCRIBED':
                setConnectionState('connected')
                break
              case 'CHANNEL_ERROR':
                setConnectionState('error')
                setError('Failed to connect to real-time service')
                break
              case 'TIMED_OUT':
                setConnectionState('error')
                setError('Connection timed out')
                break
              case 'CLOSED':
                setConnectionState('disconnected')
                break
            }
          })

        // Test basic Supabase connection
        const { error: connectionError } = await supabase.from('rooms').select('count').limit(1)
        
        if (connectionError && mounted) {
          console.warn('Supabase connection test failed:', connectionError.message)
          // Don't set error state for database connection issues
          // Real-time can still work even if database queries fail
        }

      } catch (err) {
        if (mounted) {
          setConnectionState('error')
          setError(err instanceof Error ? err.message : 'Unknown connection error')
        }
      }
    }

    initializeConnection()

    // Cleanup function
    return () => {
      mounted = false
      if (testChannel) {
        testChannel.unsubscribe()
      }
    }
  }, [])

  const value: SupabaseContextType = {
    isConnected: connectionState === 'connected',
    connectionState,
    error,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
