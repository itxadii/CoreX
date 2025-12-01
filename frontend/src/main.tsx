import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        oauth: {
          domain: 'corex-dev-6zqyuu.auth.ap-south-1.amazoncognito.com', 
          
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          
          // CRITICAL: Must match Terraform Callback URLs exactly (including trailing slash /)
          redirectSignIn: ['http://localhost:5173/'], 
          redirectSignOut: ['http://localhost:5173/login'],
          
          responseType: 'code',
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)