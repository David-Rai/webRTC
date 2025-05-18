import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SocketProvider } from '../context/Socket.jsx'
import { PeerProvider } from '../context/peerConnection.jsx'
import Home from './Home.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Room from './pages/Room.jsx'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    }, {
        path: "/room/:id",
        element: <Room />
    }
])
createRoot(document.getElementById('root')).render(
    <PeerProvider>
        <SocketProvider>
            <RouterProvider router={router} />
        </SocketProvider>
    </PeerProvider>

)
