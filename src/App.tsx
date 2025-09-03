import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

// project-imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales'; // Re-enabled with simplified implementation
import PaymentSuccessPopup from 'components/PaymentSuccessPopup';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Notistack from 'components/third-party/Notistack';
// import Metrics from 'metrics';

// providers
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { PaymentProvider } from 'contexts/PaymentContext';
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1
    }
  }
});

export default function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || '';
  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <QueryClientProvider client={queryClient}>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <AuthProvider>
                    <PaymentProvider>
                      <Notistack>
                        <RouterProvider router={router} />
                        <PaymentSuccessPopup />
                        {/* <Customization /> */}
                        {/* <Snackbar /> */}
                      </Notistack>
                    </PaymentProvider>
                  </AuthProvider>
                </GoogleOAuthProvider>
              </QueryClientProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      {/* <Metrics /> */}
    </>
  );
}
