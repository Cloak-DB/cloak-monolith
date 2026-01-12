import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider';
import { ThemeProvider } from '@/lib/theme/provider';
import { ToastProvider } from '@cloak-db/ui/components/toast';

const epilogue = localFont({
  src: '../public/fonts/Epilogue/Epilogue-VariableFont_wght.ttf',
  variable: '--font-epilogue',
  weight: '100 900',
  display: 'swap',
});

const lexendMega = localFont({
  src: '../public/fonts/Lexend_Mega/LexendMega-VariableFont_wght.ttf',
  variable: '--font-lexend-mega',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cloak DB',
  description: 'Local-first database studio for developers',
  icons: {
    icon: [
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon.ico' },
    ],
    apple: [
      {
        url: '/images/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${epilogue.variable} ${lexendMega.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="/fonts/Lexend_Mega/LexendMega-VariableFont_wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Epilogue/Epilogue-VariableFont_wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* Inline script to set theme before React hydrates - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans overflow-x-hidden">
        <ThemeProvider>
          <ToastProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
