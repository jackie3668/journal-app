import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import App from './App';
import { AchievementProvider } from './Context/AchievementContext';

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="dev-a18rmcmjp1qxbarl.us.auth0.com"
    clientId="LNyRjZrETw6Zb54QwmqPMklcoHlp5gm8"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <AuthProvider>
      <AchievementProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AchievementProvider>
    </AuthProvider>
  </Auth0Provider>
);