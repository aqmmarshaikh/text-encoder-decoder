import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { ToastProvider } from './utils/toast.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <UserProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </UserProvider>
        </AuthProvider>
    </React.StrictMode>
);
