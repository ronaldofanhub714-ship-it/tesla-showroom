import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invest • Trade • Drive',
  description: 'Premium automotive marketplace and investment platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {/* 
            The ThemeProvider injects CSS variables into :root via useEffect.
            suppressHydrationWarning prevents Next.js hydration mismatch errors
            when theme variables are injected client-side after initial render.
          */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
