import React, { useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";

const Room = () => {
    const socket = useContext(SocketContext)
    const streamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isRemote, setIsRemote] = useState(false)


    //Getting the user stream at first
    useEffect(() => {
        async function setMedias() {
            let currentStream = navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream
            setStream(currentStream)
        }
        setMedias()

    }, [])

    //READY TO GOO FROM SDP
    socket.on("ready", (message) => {
        alert(message)
        createOffer()
    })

    //STUN servers
    const servers = {
        iceservers: [
            {
                urls: ['stun:stun.l.google.com:19302']
            }
        ]
    }

    //Creating the offer
    const createOffer = async () => {
        const peerConnection = new RTCPeerConnection(servers)

        const remote = new MediaStream()

        remoteStreamRef.current.srcObject = remote

        stream.getTracks().forEach(track => {//add video,audio to peerConnection
            peerConnection.addTrack(track, stream)
        })

        peerConnection.ontrack = async (event) => {
            event.streams[0].forEach(track => {
                remoteStreamRef.current.addTrack(track)
            })
        }

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
    }

    return (
        <>
            <main className="h-screen w-full bg-primary_bg">
                <video autoPlay playsInline ref={remoteStreamRef} className="h-[100px] w-[100px] absolute bg-slate-700"></video>
                <video autoPlay playsInline ref={streamRef} className={` scale-x-[-1] ${isRemote ? "" : "h-screen w-full"}`}></video>
            </main>
        </>
    )
}


export default Room