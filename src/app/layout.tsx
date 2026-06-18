import type { Metadata } from 'next'
import './globals.css'
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import BackgroundMusic from '@/components/BackgroundMusic'

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'Lenient Cyber — Learn Cybersecurity the Practical Way',
  description:
    'Master ethical hacking, network security, and Python scripting through real-world training and projects.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body>
        <BackgroundMusic />
        {children}
      </body>
    </html>
  )
}
