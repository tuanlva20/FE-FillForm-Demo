import { useContext } from 'react';

// project-imports
import AuthContext from 'contexts/JWTContext';
// import AuthContext from 'contexts/FirebaseContext';
// import AuthContext from 'contexts/AWSCognitoContext';
// import AuthContext from 'contexts/Auth0Context';

// ==============================|| HOOKS - AUTH ||============================== //

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    // Return a fallback context instead of throwing error
    return {
      isLoggedIn: false,
      isInitialized: false,
      user: null,
      logout: () => {},
      login: () => {},
      googleLogin: () => {},
      register: () => {},
      resetPassword: () => {},
      updateProfile: () => {},
      changePassword: () => {},
      rehydrate: async () => false
    };
  }

  return context;
}
