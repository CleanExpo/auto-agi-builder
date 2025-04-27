import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ModuleContextProvider } from '@/lib/mcp';
import '@/contexts/ThemeContext'; // Import to ensure provider is registered

/**
 * Main app component that wraps all pages
 * Provides context providers and global layout
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModuleContextProvider>
      <Component {...pageProps} />
    </ModuleContextProvider>
  );
}
