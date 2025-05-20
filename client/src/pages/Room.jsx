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
    const offerState = useRef(false)
    const answerState = useRef(false)
    const [ice, setIce] = useState([])


    //Add the ICE Candidate when remoteDescription is set
    useEffect(() => {
            if (
                peerConnection.remoteDescription &&
                peerConnection.remoteDescription.type &&
                ice.length > 0
            ) {
                console.log("📥 Flushing buffered ICE candidates");
                addICE();
                setIce([]); // Clear after adding
            }
    
        // return () => clearInterval(interval);
    }, [ice, peerConnection.remoteDescription]);

    
    //Adding the remote track to the peer instance
    const addShit = async () => {
        console.log("adding the track")
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

        if (stream) {
            stream.getTracks().forEach(track => {//add video,audio to peerConnection
                peerConnection.addTrack(track, stream)
            })
        }

        peerConnection.ontrack = async (e) => {
            if (e.streams[0]) {
                remoteStreamRef.current.srcObject = e.streams[0];
            }
        }

        //ICE candidate generation and sending to the remote user
        peerConnection.onicecandidate = async (e) => {
            if (e.candidate) {
                socket.emit("ice", { candidate: e.candidate, roomId: id })
            }
        }

    }
    //Handling the candidate
    const handleICE = async (candidate) => {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            setIce(prev => [...prev, candidate]);
        }
    };
    
    //Adding the ICE candidate
    const addICE=async ()=>{
        for (const candidate of ice) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("🧊 Buffered ICE candidate added");
            } catch (e) {
                console.error("❌ Error adding ICE:", e);
            }
        }
        
    }

    //Handling on getting the offer
    const handleOffer=async (offer)=>{
        if (offerState.current) return
        offerState.current = true

        console.log("offer", offer)
        await addShit()

        await peerConnection.setRemoteDescription(offer)
        await addICE()

        //Generating the answer SDP
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        socket.emit("answer", { answer: peerConnection.localDescription, roomId: id })

    }

    //Handling on getting the answer
    const handleAnswer=async (answer)=>{
        if (answerState.current) return
        answerState.current = true

        console.log("answer", answer)

        await peerConnection.setRemoteDescription(answer)
        await addICE()
    }
    
    //Getting the user stream at first
    useEffect(() => {
        offerState.current = false
        answerState.current = false

        // Adding the new ICE Candidate
        socket.on("ice", handleICE);

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
        }
        setMedias()

        //READY TO GOO FROM SDP
        socket.on("ready", (message) => {
            createOffer()
        })

        //Getting the offer from the one peer and generating the answer
        socket.on("send_offer",handleOffer)


        //Getting the answer from the remote peer
        socket.on("send_answer",handleAnswer)



    }, [])

    //Creating the offer
    const createOffer = async () => {
        await addShit()
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        socket.emit("offer", { offer, roomId: id })
    }

    return (
        <>
            <main className="h-screen w-full bg-primary_bg">
                <video autoPlay playsInline ref={remoteStreamRef} className="h-screen w-full"></video>
                <video autoPlay playsInline ref={streamRef} className="h-[200px] z-20 w-[200px] absolute top-2 left-2 rounded-md"></video>
            </main>
        </>
    )
}


export default Room