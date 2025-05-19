import React, { useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";
import { useParams } from 'react-router-dom'
import { PeerContext } from "../../context/peerConnection";

const Room = () => {
    const socket = useContext(SocketContext)
    const peerConnection = useContext(PeerContext)
    const { id } = useParams()
    const streamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    // const [stream, setStream] = useState(null)
    const [isRemote, setIsRemote] = useState(false)
    const offerState = useRef(false)
    const answerState = useRef(false)


    //Getting the user stream at first
    useEffect(() => {
        offerState.current = false
        answerState.current = false

        peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", peerConnection.connectionState);

            switch (peerConnection.connectionState) {
                case "connected":
                    console.log("✅ Peers are connected");
                    break;
                case "disconnected":
                case "failed":
                    console.log("⚠️ Peers are disconnected or connection failed");
                    break;
                case "closed":
                    console.log("❌ Connection closed");
                    break;
            }
        }

        async function setMedias() {
            let currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream
            // setStream(currentStream)
        }
        setMedias()
    }, [])

    //READY TO GOO FROM SDP
    socket.on("ready", (message) => {
        createOffer()
    })

    //Getting the offer from the one peer and generating the answer
    socket.on("send_offer", async (offer) => {
        if (offerState.current) return
        offerState.current = true

        console.log("offer recieved")
        console.log(offer)

        await peerConnection.setRemoteDescription(offer)

        const remote = new MediaStream()

        remoteStreamRef.current.srcObject = remote

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (stream) {
            console.log(stream)
            stream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, stream)
            })
        } else {
            console.log("no stream")
            let currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream

            currentStream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, currentStream)
            })

            console.log(currentStream)
        }

        peerConnection.ontrack = async (e) => {
            e.streams[0].getTracks().forEach(track => {
                remoteStreamRef.current.addTrack(track)
            })
        }


        //ICE candidate generation and sending to the remote user
        peerConnection.onicecandidate = async (e) => {
            if (e.candidate) {
                socket.emit("answer", { answer: peerConnection.localDescription, roomId: id })
            }
        }

        //Generating the answer SDP
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

    })

    //Getting the answer from the remote peer
    socket.on("send_answer", async (answer) => {
        if (answerState.current) return
        answerState.current = true

        console.log("answer received ")
        console.log(answer)
        await peerConnection.setRemoteDescription(answer)
    })

    //Creating the offer
    const createOffer = async () => {
        const remote = new MediaStream()
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })


        remoteStreamRef.current.srcObject = remote


        if (stream) {
            console.log(stream)
            stream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, stream)
            })
        } else {
            console.log("no stream")
            let currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream

            currentStream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, currentStream)
            })

            console.log(currentStream)
        }

        peerConnection.ontrack = async (e) => {
            e.streams[0].getTracks().forEach(track => {
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