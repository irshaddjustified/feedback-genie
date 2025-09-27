import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

// Define a custom socket property type that doesn't conflict with ServerResponse.socket
export interface SocketServer extends Omit<NextApiResponse, 'socket'> {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer
    }
  }
}

// Define event name constants for type safety
export enum SocketEvents {
  NEW_RESPONSE = 'new-response',
  ANALYSIS_COMPLETE = 'analysis-complete',
  METRICS_UPDATE = 'metrics-update',
  SURVEY_PUBLISHED = 'survey-published',
  NOTIFICATION = 'notification',
  SUBSCRIBE_DASHBOARD = 'subscribe-dashboard',
  SUBSCRIBE_PROJECT = 'subscribe-project',
  SUBSCRIBE_SURVEY = 'subscribe-survey',
  UNSUBSCRIBE = 'unsubscribe'
}

// WebSocket event types
export interface ServerToClientEvents {
  'new-response': (data: {
    surveyId: string
    responseId: string
    surveyTitle: string
    sentiment?: string
    priority?: string
    preview: string
  }) => void
  
  'analysis-complete': (data: {
    responseId: string
    surveyId: string
    sentiment: string
    priority: string
    categories: string[]
  }) => void
  
  'metrics-update': (data: {
    totalResponses: number
    avgSentiment: number
    criticalCount: number
    recentActivity: any[]
  }) => void
  
  'survey-published': (data: {
    surveyId: string
    title: string
    shareLink: string
  }) => void
  
  'notification': (data: {
    id: string
    type: string
    title: string
    message: string
    timestamp: Date
  }) => void
}

export interface ClientToServerEvents {
  'subscribe-dashboard': () => void
  'subscribe-project': (projectId: string) => void
  'subscribe-survey': (surveyId: string) => void
  'unsubscribe': (room: string) => void
}

export class WebSocketManager {
  private static instance: WebSocketManager
  private io: SocketIOServer | null = null

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  initialize(server: HTTPServer) {
    if (this.io) return this.io

    this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
      path: '/api/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Subscribe to dashboard updates
      socket.on(SocketEvents.SUBSCRIBE_DASHBOARD, () => {
        socket.join('dashboard')
        console.log('Client subscribed to dashboard:', socket.id)
      })

      // Subscribe to project-specific updates
      socket.on(SocketEvents.SUBSCRIBE_PROJECT, (projectId) => {
        socket.join(`project:${projectId}`)
        console.log(`Client subscribed to project ${projectId}:`, socket.id)
      })

      // Subscribe to survey-specific updates
      socket.on(SocketEvents.SUBSCRIBE_SURVEY, (surveyId) => {
        socket.join(`survey:${surveyId}`)
        console.log(`Client subscribed to survey ${surveyId}:`, socket.id)
      })

      // Handle unsubscribe
      socket.on(SocketEvents.UNSUBSCRIBE, (room) => {
        socket.leave(room)
        console.log(`Client unsubscribed from ${room}:`, socket.id)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    return this.io
  }

  getIO(): SocketIOServer | null {
    return this.io
  }

  // Event emitters for application events

  emitNewResponse(data: {
    surveyId: string
    responseId: string
    surveyTitle: string
    projectId?: string
    sentiment?: string
    priority?: string
    preview: string
  }) {
    if (!this.io) return

    // Emit to dashboard
    this.io.to('dashboard').emit(SocketEvents.NEW_RESPONSE, {
      surveyId: data.surveyId,
      responseId: data.responseId,
      surveyTitle: data.surveyTitle,
      sentiment: data.sentiment,
      priority: data.priority,
      preview: data.preview
    })

    // Emit to specific project room if applicable
    if (data.projectId) {
      this.io.to(`project:${data.projectId}`).emit(SocketEvents.NEW_RESPONSE, {
        surveyId: data.surveyId,
        responseId: data.responseId,
        surveyTitle: data.surveyTitle,
        sentiment: data.sentiment,
        priority: data.priority,
        preview: data.preview
      })
    }

    // Emit to specific survey room
    this.io.to(`survey:${data.surveyId}`).emit(SocketEvents.NEW_RESPONSE, {
      surveyId: data.surveyId,
      responseId: data.responseId,
      surveyTitle: data.surveyTitle,
      sentiment: data.sentiment,
      priority: data.priority,
      preview: data.preview
    })
  }

  emitAnalysisComplete(data: {
    responseId: string
    surveyId: string
    projectId?: string
    sentiment: string
    priority: string
    categories: string[]
  }) {
    if (!this.io) return

    // Emit to dashboard
    this.io.to('dashboard').emit(SocketEvents.ANALYSIS_COMPLETE, data)

    // Emit to specific project room if applicable
    if (data.projectId) {
      this.io.to(`project:${data.projectId}`).emit(SocketEvents.ANALYSIS_COMPLETE, data)
    }

    // Emit to specific survey room
    this.io.to(`survey:${data.surveyId}`).emit(SocketEvents.ANALYSIS_COMPLETE, data)
  }

  emitMetricsUpdate(metrics: {
    totalResponses: number
    avgSentiment: number
    criticalCount: number
    recentActivity: any[]
  }) {
    if (!this.io) return

    this.io.to('dashboard').emit(SocketEvents.METRICS_UPDATE, metrics)
  }

  emitSurveyPublished(data: {
    surveyId: string
    title: string
    shareLink: string
    projectId?: string
  }) {
    if (!this.io) return

    // Emit to dashboard
    this.io.to('dashboard').emit(SocketEvents.SURVEY_PUBLISHED, {
      surveyId: data.surveyId,
      title: data.title,
      shareLink: data.shareLink
    })

    // Emit to specific project room if applicable
    if (data.projectId) {
      this.io.to(`project:${data.projectId}`).emit(SocketEvents.SURVEY_PUBLISHED, {
        surveyId: data.surveyId,
        title: data.title,
        shareLink: data.shareLink
      })
    }
  }

  emitNotification(notification: {
    id: string
    type: string
    title: string
    message: string
    timestamp: Date
  }) {
    if (!this.io) return

    this.io.to('dashboard').emit(SocketEvents.NOTIFICATION, notification)
  }

  // Utility methods

  getConnectedClientsCount(): number {
    if (!this.io) return 0
    return this.io.engine.clientsCount
  }

  getRoomMemberCount(room: string): number {
    if (!this.io) return 0
    return this.io.sockets.adapter.rooms.get(room)?.size || 0
  }

  broadcastToRoom<K extends keyof ServerToClientEvents>(
    room: string, 
    event: K, 
    data: Parameters<ServerToClientEvents[K]>[0]
  ) {
    if (!this.io) return
    this.io.to(room).emit(event, data)
  }
}

// Export singleton instance
export const wsManager = WebSocketManager.getInstance()

