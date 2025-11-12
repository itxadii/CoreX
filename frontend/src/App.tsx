// import { useState } from 'react';
// import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import ChatPage from '../pages/ChatPage';
import '@aws-amplify/ui-react/styles.css';


const App = () => {
  return (
    <Authenticator>
      <ChatPage />
    </Authenticator>
  )
}

export default App