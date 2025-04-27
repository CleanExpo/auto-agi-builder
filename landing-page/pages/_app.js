import '../styles/globals.css';
import { withUIProvider } from '../lib/mcp';

// Import context providers to register them
import '../contexts/ThemeContext';
import '../contexts/UIContext';

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// Wrap the app with the UI provider
export default withUIProvider(App);
