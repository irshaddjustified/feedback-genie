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
    
    const filters = projectId ? { projectId } : undefined
    const surveys = await database.surveys.findMany(filters)
    
    return NextResponse.json(surveys)
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
    if (!body.name) {
      return NextResponse.json({ error: 'Survey name is required' }, { status: 400 })
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
      name: body.name,
      type: body.type || 'client-project',
      description: body.description || '',
      questions: body.questions || [],
      isActive: body.isActive || false,
      shareLink: crypto.randomUUID(), // Generate a unique share link
      status: 'DRAFT'
    })
    
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
