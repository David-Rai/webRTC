import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SocketProvider } from '../context/Socket.jsx'
import Home from './Home.jsx'

createRoot(document.getElementById('root')).render(
    <SocketProvider>
    <Home />
    </SocketProvider>
)
