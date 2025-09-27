'use client'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/contexts/AuthContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}
