import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EQUINOX – AI Workspace',
  description: 'Your premium integrated AI workspace',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark theme-crimson-noir" suppressHydrationWarning>
      <head />
      <body className="bg-app-primary text-app-primary antialiased">
        {children}
      </body>
    </html>
  );
}
