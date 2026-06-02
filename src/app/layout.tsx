import type { Metadata } from 'next'
import './globals.css'
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'Lenient Cyber — Learn Cybersecurity the Practical Way',
  description:
    'Master ethical hacking, network security, and Python scripting through real-world training and projects.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body>{children}</body>
    </html>
  )
}
