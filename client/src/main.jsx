import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SocketProvider } from '../context/Socket.jsx'
import { PeerProvider } from '../context/peerConnection.jsx'
import Home from './Home.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Room from './pages/Room.jsx'
import { ToastContainer } from 'react-toastify'

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
            <ToastContainer autoClose={500} />
        </SocketProvider>
    </PeerProvider>

)
