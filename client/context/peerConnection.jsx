import { createContext } from "react";
import React from "react";

export const PeerContext = createContext(null)

//STUN servers
const servers = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
}

//peer provider
export const PeerProvider =({ children }) => {
    const peerConnection = React.useMemo(() => new RTCPeerConnection(servers), []);

    return (
        <PeerContext.Provider value={peerConnection} >
            {
                children
            }
        </PeerContext.Provider >
    )
}
