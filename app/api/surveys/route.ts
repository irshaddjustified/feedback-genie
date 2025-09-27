import { NextRequest, NextResponse } from 'next/server'
import { createContext } from '@/lib/context'
import { database } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    try {
      const surveys = await database.surveys.findMany(projectId || undefined)
      return NextResponse.json(surveys || [])
    } catch (dbError) {
      console.error('Database error fetching surveys:', dbError)
      // Return empty array if database fails
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Survey title is required' }, { status: 400 })
    }
    
    if (!body.projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project exists
    const project = await database.projects.findById(body.projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const survey = await database.surveys.create({
      projectId: body.projectId,
      title: body.title,
      type: body.type || 'client-project',
      description: body.description || '',
      questions: body.questions || [],
      isActive: body.isActive || false,
      shareLink: body.shareLink || crypto.randomUUID(), // Use provided shareLink or generate fallback
      status: body.status || 'DRAFT'
    })
    
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
