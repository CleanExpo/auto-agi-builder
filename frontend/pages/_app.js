import { UIProvider } from '../contexts/UIContext';
import { AuthProvider } from '../contexts/AuthContext';

export default ({Component, pageProps}) => (
  <AuthProvider>
    <UIProvider>
      <Component {...pageProps}/>
    </UIProvider>
  </AuthProvider>
)
