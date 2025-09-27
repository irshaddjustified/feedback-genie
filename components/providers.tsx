'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { api } from '@/lib/trpc-client'

interface ProvidersProps {
  children: React.ReactNode
}

function ProvidersInner({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}

export const Providers = api.withTRPC(ProvidersInner)
