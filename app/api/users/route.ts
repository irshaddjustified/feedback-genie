import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/prisma'
import { authService, updateUserRole } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    const users = await database.users.findMany(organizationId || undefined)
    
    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, role, organizationId } = body
    
    if (!uid || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      )
    }
    
    // Update user role
    await updateUserRole(uid, role, organizationId)
    
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
