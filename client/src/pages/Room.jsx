import React, { useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";
import { useParams } from 'react-router-dom'

const Room = () => {
    const socket = useContext(SocketContext)
    const { id } = useParams()
    const streamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isRemote, setIsRemote] = useState(false)


    //Getting the user stream at first
    useEffect(() => {
        async function setMedias() {
            let currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream
            setStream(currentStream)
        }
        setMedias()

    }, [])

    //STUN servers
    const servers = {
        iceservers: [
            {
                urls: ['stun:stun.l.google.com:19302']
            }
        ]
    }

    //READY TO GOO FROM SDP
    socket.on("ready", (message) => {
        createOffer()
    })

    //Getting the offer from the one peer
    socket.on("send_offer", async (offer) => {
        console.log("offer recieved")
        console.log(offer)
        const peerConnection = new RTCPeerConnection(servers)
        await peerConnection.setRemoteDescription(offer)

        const remote = new MediaStream()

        remoteStreamRef.current.srcObject = remote

        if (stream) {
            stream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, stream)
            })

        }

        peerConnection.ontrack = async (event) => {
            event.streams[0].forEach(track => {
                remoteStreamRef.current.addTrack(track)
            })
        }

        //ICE candidate generation and sending to the remote user
        peerConnection.onicecandidate = async (e) => {
            if (e.candidate) {
                socket.emit("answer", { answer: peerConnection.remoteDescription, roomId: id })
            }
        }

        //Generating the answer SDP
        const answer = await peerConnection.createAnswer()
        await peerConnection.setRemoteDescription(answer)

    })


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

        //ICE candidate generation and sending to the remote user
        peerConnection.onicecandidate = async (e) => {
            if (e.candidate) {
                socket.emit("offer", { offer: peerConnection.localDescription, roomId: id })
            }
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