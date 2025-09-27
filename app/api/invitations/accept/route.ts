import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/prisma'
import { authService, saveUserToDatabase } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userUid } = body
    
    if (!token || !userUid) {
      return NextResponse.json(
        { success: false, error: 'Token and user UID are required' },
        { status: 400 }
      )
    }
    
    // Find invitation by token
    const invitation = await database.invitations.findByToken(token)
    
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 404 }
      )
    }
    
    // Check if invitation is still valid
    if ((invitation as any).status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Invitation has already been used or expired' },
        { status: 400 }
      )
    }
    
    // Check if invitation has expired
    const now = new Date()
    const expiresAt = (invitation as any).expiresAt
    if (expiresAt && new Date(expiresAt) < now) {
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      )
    }
    
    // Update user with new role and organization
    const invitationData = invitation as any
    const userData = {
      uid: userUid,
      email: invitationData.email,
      role: invitationData.role,
      organizationId: invitationData.organizationId,
      permissions: [], // Will be set by convertFirebaseUser
      isAnonymous: false,
      createdAt: new Date(),
      lastLoginAt: new Date()
    }
    
    await saveUserToDatabase(userData as any)
    
    // Mark invitation as accepted
    await database.invitations.update(invitationData.id, {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedByUid: userUid
    })
    
    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        role: invitationData.role,
        organizationId: invitationData.organizationId,
        organizationName: invitationData.organizationName
      }
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
