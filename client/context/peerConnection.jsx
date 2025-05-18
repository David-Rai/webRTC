import { createContext } from "react";

export const peerContext = createContext(null)

//STUN servers
const servers = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        }
    ]
}

//peer provider
export const peerProvider =({ children }) => {
    const peerConnection = React.useMemo(() => new RTCPeerConnection(servers), []);

    return (
        <peerContext.Provider value={peerConnection} >
            {
                children
            }
        </peerContext.Provider >
    )
}
