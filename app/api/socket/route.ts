import { NextRequest, NextResponse } from 'next/server'
import { wsManager } from '@/lib/websocket/server'

// This route provides WebSocket server status and management
export async function GET(req: NextRequest) {
  try {
    const io = wsManager.getIO()
    const isConnected = io !== null
    const clientsCount = wsManager.getConnectedClientsCount()
    
    return NextResponse.json({
      success: true,
      websocket: isConnected ? 'connected' : 'not_connected',
      clientsCount,
      message: 'WebSocket server status'
    })
  } catch (error) {
    console.error('WebSocket route error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get WebSocket status' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    const io = wsManager.getIO()
    if (!io) {
      return NextResponse.json(
        { success: false, error: 'WebSocket server not initialized' },
        { status: 503 }
      )
    }

    // Handle WebSocket actions using the WebSocket manager
    switch (action) {
      case 'broadcast':
        if (data.event && data.payload) {
          io.emit(data.event, data.payload)
          return NextResponse.json({ success: true, message: 'Broadcast sent' })
        }
        break
      
      case 'room-broadcast':
        if (data.room && data.event && data.payload) {
          wsManager.broadcastToRoom(data.room, data.event, data.payload)
          return NextResponse.json({ success: true, message: 'Room broadcast sent' })
        }
        break

      case 'notification':
        if (data.notification) {
          wsManager.emitNotification(data.notification)
          return NextResponse.json({ success: true, message: 'Notification sent' })
        }
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  } catch (error) {
    console.error('WebSocket POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
