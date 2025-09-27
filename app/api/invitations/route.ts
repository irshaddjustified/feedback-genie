import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/prisma'
import { authService } from '@/lib/firebase'

// Generate a random invitation token
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    const invitations = await database.invitations.findMany(organizationId || undefined)
    
    return NextResponse.json({
      success: true,
      data: invitations
    })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      role, 
      organizationId, 
      organizationName,
      invitedBy,
      message 
    } = body
    
    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Email, role, and organization ID are required' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await database.users.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists in the system' },
        { status: 400 }
      )
    }
    
    // Check if invitation already exists
    const existingInvitations = await database.invitations.findMany(organizationId)
    const pendingInvitation = existingInvitations.find(
      (inv: any) => inv.email === email && inv.status === 'pending'
    )
    
    if (pendingInvitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation already sent to this email' },
        { status: 400 }
      )
    }
    
    // Create new invitation
    const token = generateInvitationToken()
    const invitation = await database.invitations.create({
      email,
      role,
      organizationId,
      organizationName,
      invitedBy,
      message: message || `You have been invited to join ${organizationName}`,
      token,
      status: 'pending'
    })
    
    // TODO: Send email invitation here
    // In a real implementation, you would integrate with an email service
    
    return NextResponse.json({
      success: true,
      data: invitation,
      message: 'Invitation sent successfully'
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
