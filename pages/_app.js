import '../styles/globals.css';
import { AllProviders } from '../contexts';

function MyApp({ Component, pageProps }) {
  return (
    <AllProviders>
      <Component {...pageProps} />
    </AllProviders>
  );
}

export default MyApp;
