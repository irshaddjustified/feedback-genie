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
    const clientId = searchParams.get('clientId')
    
    try {
      const projects = await database.projects.findMany(clientId || undefined)
      return NextResponse.json(projects || [])
    } catch (dbError) {
      console.error('Database error fetching projects:', dbError)
      // Return empty array if database fails
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
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
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }
    
    if (!body.clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // Verify client exists
    const client = await database.clients.findById(body.clientId)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const project = await database.projects.create({
      clientId: body.clientId,
      name: body.name,
      description: body.description || '',
      status: body.status || 'active'
    })
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
