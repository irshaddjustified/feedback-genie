'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents, SocketEvents } from '@/lib/websocket/server'

type WebSocketEvents = ServerToClientEvents

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const listenersRef = useRef<Map<keyof WebSocketEvents, Function[]>>(new Map())

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket.io',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      timeout: 20000
    })

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id)
    })

    socket.on('disconnect', (reason: any) => {
      console.log('WebSocket disconnected:', reason)
    })

    socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error)
    })

    socketRef.current = socket
    return socket
  }, [reconnection, reconnectionAttempts, reconnectionDelay])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event: keyof ClientToServerEvents, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event as any, ...args)
    }
  }, [])

  const on = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => {
    // Store callback reference
    const listeners = listenersRef.current.get(event) || []
    listeners.push(callback)
    listenersRef.current.set(event, listeners)

    // Add listener to socket if connected
    if (socketRef.current) {
      socketRef.current.on(event as any, callback as any)
    }

    // Return cleanup function
    return () => {
      const currentListeners = listenersRef.current.get(event) || []
      const filteredListeners = currentListeners.filter(l => l !== callback)
      listenersRef.current.set(event, filteredListeners)

      if (socketRef.current) {
        socketRef.current.off(event as any, callback as any)
      }
    }
  }, [])

  const off = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event as any, callback as any)
      } else {
        socketRef.current.off(event as any)
      }
    }

    // Clean up stored listeners
    if (callback) {
      const listeners = listenersRef.current.get(event) || []
      const filteredListeners = listeners.filter(l => l !== callback)
      listenersRef.current.set(event, filteredListeners)
    } else {
      listenersRef.current.delete(event)
    }
  }, [])

  // Dashboard-specific methods
  const subscribeToDashboard = useCallback(() => {
    emit('subscribe-dashboard' as any)
  }, [emit])

  const subscribeToProject = useCallback((projectId: string) => {
    emit('subscribe-project' as any, projectId)
  }, [emit])

  const subscribeToSurvey = useCallback((surveyId: string) => {
    emit('subscribe-survey' as any, surveyId)
  }, [emit])

  const unsubscribe = useCallback((room: string) => {
    emit('unsubscribe' as any, room)
  }, [emit])

  // Initialize connection
  useEffect(() => {
    if (autoConnect) {
      const socket = connect()

      // Re-attach stored listeners
      listenersRef.current.forEach((listeners, event) => {
        listeners.forEach(callback => {
          socket.on(event as any, callback as any)
        })
      })
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
    subscribeToDashboard,
    subscribeToProject,
    subscribeToSurvey,
    unsubscribe,
    isConnected: socketRef.current?.connected || false
  }
}

// Convenience hooks for specific use cases

export function useDashboardWebSocket() {
  const ws = useWebSocket()

  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribeToDashboard()
    }
  }, [ws.isConnected, ws.subscribeToDashboard])

  return ws
}

export function useProjectWebSocket(projectId: string) {
  const ws = useWebSocket()

  useEffect(() => {
    if (ws.isConnected && projectId) {
      ws.subscribeToProject(projectId)
      
      return () => {
        ws.unsubscribe(`project:${projectId}`)
      }
    }
  }, [ws.isConnected, projectId, ws.subscribeToProject, ws.unsubscribe])

  return ws
}

export function useSurveyWebSocket(surveyId: string) {
  const ws = useWebSocket()

  useEffect(() => {
    if (ws.isConnected && surveyId) {
      ws.subscribeToSurvey(surveyId)
      
      return () => {
        ws.unsubscribe(`survey:${surveyId}`)
      }
    }
  }, [ws.isConnected, surveyId, ws.subscribeToSurvey, ws.unsubscribe])

  return ws
}
