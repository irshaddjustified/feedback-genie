import { NextRequest, NextResponse } from 'next/server'
import { createContext } from '@/lib/context'
import { database } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('surveyId')
    
    const responses = await database.responses.findMany(surveyId || undefined)
    
    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // For responses, we allow anonymous submissions
    const body = await request.json()
    
    // Validate required fields
    if (!body.surveyId || !body.responseData) {
      return NextResponse.json({ 
        error: 'Survey ID and response data are required' 
      }, { status: 400 })
    }

    const response = await database.responses.create({
      ...body,
      completionRate: body.completionRate || 100,
      // Store device info for analytics
      deviceInfo: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
