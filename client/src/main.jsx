import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import App from './App.jsx';
import { AuthProvider } from '../context/authContext.jsx';
import { ChatProvider } from '../context/chatContext.jsx';  // <-- IMPORT IT

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>  {/* <-- WRAP APP INSIDE CHAT PROVIDER */}
        <App />
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);
