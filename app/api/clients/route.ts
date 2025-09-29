import { NextRequest, NextResponse } from 'next/server'
import { createContext } from '@/lib/context'
import { database } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.user || context.user.isAnonymous) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    const clients = await database.clients.findMany(organizationId || undefined)
    
    // Add project count for each client
    const clientsWithProjectCount = await Promise.all(
      clients.map(async (client) => {
        const projects = await database.projects.findMany(client.id)
        return {
          ...client,
          projectCount: projects.length
        }
      })
    )
    
    return NextResponse.json(clientsWithProjectCount)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.user || context.user.isAnonymous) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }
    
    if (!body.organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Verify organization exists or create a default one
    let organization = await database.organization.findById(body.organizationId)
    
    // If organization doesn't exist and it's the default, create it
    if (!organization && body.organizationId === 'default-org') {
      // Create default organization - Firebase will auto-generate ID, so we'll use that
      const defaultOrgs = await database.organization.findMany()
      if (defaultOrgs.length === 0) {
        organization = await database.organization.create({
          name: 'Default Organization',
          description: 'Default organization for the application'
        })
      } else {
        // Use the first existing organization
        organization = defaultOrgs[0]
      }
      
      // Update the body to use the actual organization ID
      if (organization) {
        body.organizationId = organization.id
      }
    }
    
    // If still no organization found, return error
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const client = await database.clients.create({
      organizationId: body.organizationId,
      name: body.name,
      email: body.email || '',
      description: body.description || ''
    })
    
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
