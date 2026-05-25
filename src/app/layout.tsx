import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Inter is the closest web match to Arial (our brand font)
// Next.js loads this at build time — no flash of unstyled text
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LinkedIn Post Optimizer',
  description:
    'Paste any LinkedIn post and get an instant AI analysis — hook strength, readability, authenticity, engagement potential, and AI-detection score.',
  openGraph: {
    title: 'LinkedIn Post Optimizer',
    description: 'Score your LinkedIn post. Get AI-powered analysis and improvement suggestions.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
