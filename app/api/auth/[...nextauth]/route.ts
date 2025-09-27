// NextAuth route - disabled since we're using Firebase auth primarily
// import NextAuth from 'next-auth'
// import { authOptions } from '@/lib/auth'

import { NextRequest, NextResponse } from 'next/server'

// Simple placeholder handlers since we use Firebase auth
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth route disabled - using Firebase auth',
    redirect: '/auth/login'
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth route disabled - using Firebase auth',
    redirect: '/auth/login'
  }, { status: 200 })
}
