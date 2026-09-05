import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import VeridField from '@/components/three/VeridField'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Verid — cross-miner truth verification',
  description:
    'Paste a claim, Verid asks three live Telegraph miners at once and shows you the truth signal and exactly where they disagreed.',
}

/**
 * Root layout. Mounts the VeridField canvas once at app root and the noise
 * grain overlay, both fixed behind all section content.
 * @param props - children of the layout
 * @returns the root HTML document
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon slot: replace with public/favicon.ico only after explicit ask */}
      </head>
      <body>
        <VeridField />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[3] opacity-[0.025]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {children}
      </body>
    </html>
  )
}
