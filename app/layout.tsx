import type React from "react"
import type { Metadata } from "next"
import { Albert_Sans, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "FeedbackGenie - AI-Powered Feedback Portal",
  description: "Collect structured feedback with AI-powered insights",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${albertSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Suspense>
              {children}
              <Analytics />
            </Suspense>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
