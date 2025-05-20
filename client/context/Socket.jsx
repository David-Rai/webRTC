import { createContext } from "react";
import {io} from 'socket.io-client'

export const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
    const socket = io("https://webrtc-fvt3.onrender.com/")
    
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )

}

