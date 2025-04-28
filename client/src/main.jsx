import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SocketProvider } from '../context/Socket.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <SocketProvider>
    <App />
    </SocketProvider>
)
