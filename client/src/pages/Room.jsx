import React, { useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";
import { useParams } from 'react-router-dom'
import { PeerContext } from "../../context/peerConnection";
import { FaVideoSlash } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import waitingGif from '../assets/wait.gif'
import { useNavigate } from "react-router-dom";

const Room = () => {
    const socket = useContext(SocketContext)
    const peer = useContext(PeerContext)
    let { peerConnection, setPeerConnection, createConnection } = peer
    const { id } = useParams()
    const streamRef = useRef(null)
    const remoteStreamRef = useRef(null)
    const offerState = useRef(false)
    const answerState = useRef(false)
    const [ice, setIce] = useState([])
    const localStream = useRef(null)
    const navigate = useNavigate()
    const [isRemote, setIsRemote] = useState(false)
    const [isStopVideo, setStopVideo] = useState(false)


    //Add the ICE Candidate when remoteDescription is set
    useEffect(() => {
        if (!peerConnection) {
            return
        }
        if (
            peerConnection.remoteDescription &&
            peerConnection.remoteDescription.type &&
            ice.length > 0
        ) {
            console.log("📥 Flushing buffered ICE candidates");
            addICE();
            setIce([]); // Clear after adding
        }

    }, [ice, peerConnection && peerConnection.remoteDescription]);


    //Adding the remote track to the peer instance
    const addShit = async () => {
        if (!peerConnection) return

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
        if (!peerConnection) return

        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            setIce(prev => [...prev, candidate]);
        }
    };

    //Adding the ICE candidate
    const addICE = async () => {
        if (!peerConnection) return

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
    const handleOffer = async (offer) => {
        if (!peerConnection) return

        if (offerState.current) return
        offerState.current = true

        setIsRemote(true)

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
    const handleAnswer = async (answer) => {
        if (!peerConnection) return

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
        localStream.current = null

        // Adding the new ICE Candidate
        socket.on("ice", handleICE);

        if (peerConnection) {

            peerConnection.onconnectionstatechange = () => {
                console.log("Connection state:", peerConnection.connectionState);

                switch (peerConnection.connectionState) {
                    case "connected":
                        console.log("✅ Peers are connected");
                        break;
                    case "disconnected":
                    case "failed":
                        handlePeerLeave()
                        console.log("⚠️ Peers are disconnected or connection failed");
                        break;
                    case "closed":
                        console.log("❌ Connection closed");
                        break;
                }
            }
        }

        async function setMedias() {
            let currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            streamRef.current.srcObject = currentStream
            localStream.current = currentStream
        }
        setMedias()

        //READY TO GOO FROM SDP
        socket.on("ready", (message) => {
            createOffer()
        })

        //Getting the offer from the one peer and generating the answer
        socket.on("send_offer", handleOffer)

        //Getting the answer from the remote peer
        socket.on("send_answer", handleAnswer)

        //Cutting the connection
        socket.on("leave", handlePeerLeave)

        //someone is stopping the video share notification
        socket.on("stopping-video", handleStopVideo)

        socket.on("redo-stopping-video", handleStartVideo)

        return () => {
            socket.off("ice", handleICE);
            socket.off("send_offer", handleOffer);
            socket.off("send_answer", handleAnswer);
            socket.off("leave", handlePeerLeave);
            socket.off("stopping-video", handleStopVideo)
            socket.off("redo-stopping-video", handleStartVideo)
        };


    }, [])

    //Handling the stop video 
    const handleStopVideo = async (message) => {
        setIsRemote(false)
    }

    //Starting the video
    const handleStartVideo = async (message) => {
        setIsRemote(true)
    }

    //Creating the offer
    const createOffer = async () => {
        if (!peerConnection) return

        await addShit()
        setIsRemote(true)
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        socket.emit("offer", { offer, roomId: id })
    }

    //Handling the stop video
    const handlePeerLeave = async (message) => {
        console.log("you need to disconnecting")
        //Stoping the local stream
        streamRef.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })

        //Stoping the remote stream
        remoteStreamRef.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })

        if (peerConnection) {
            peerConnection.close()
            setPeerConnection(null)
            createConnection()
        }
        navigate("/")
    }

    const EndRTC = () => {
        console.log("disconnecting")
        //Stoping the local stream
        streamRef.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })

        //Stoping the remote stream
        remoteStreamRef.current.srcObject.getTracks().forEach(track => {
            track.stop()
        })

        if (peerConnection) {
            setPeerConnection(null)
            peerConnection.close()
            createConnection()
        }
        navigate("/")
        socket.emit("leave", { roomId: id })
    }

    //Stop video or webCam
    const stopVideo = async (what) => {
        if (!peerConnection) return

        if (what === "stop") {
            console.log("stop the video right noew.")

            setStopVideo(true)

            //Removing the track
            peerConnection.getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === 'video') {
                    peerConnection.removeTrack(sender);
                    socket.emit("stop-video", { roomId: id })
                }
            });
            return
        }

        if (what === "redo") {
            setStopVideo(false)

            //getting the video stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const newTrack = stream.getVideoTracks()[0]; // or getAudioTracks()[0]
            peerConnection.addTrack(newTrack, stream);
            console.log(newTrack)

            //Generating the new offer for renogiation
            createOffer()

            socket.emit("redo-stop-video", { roomId: id })
        }
    }


    return (
        <>
            <main className="h-screen w-full bg-primary_bg">
                {
                    isRemote ? (
                        <video autoPlay playsInline ref={remoteStreamRef} className="h-screen w-full"></video>
                    )
                        :
                        (
                            <div className="h-screen flex items-center justify-center w-full">
                                <img src={waitingGif} className="rounded-lg h-[60%]" />
                            </div>
                        )
                }
                <video
                    autoPlay
                    playsInline
                    ref={streamRef}
                    className="h-[200px] z-20 w-[200px] absolute top-3 left-2 rounded-3xl object-cover scale-x-[-1] border-4 border-white"
                />


                {/* CONTROLS */}
                <section className="absolute bottom-0 w-full h-[120px] flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-lg w-[60%] md:w-[50%] lg:w-[30%]  h-[60px] rounded-full flex items-center justify-center gap-3">
                        <button className="control-btn">
                            {
                                isStopVideo ? (
                                    <FaVideoSlash onClick={() => stopVideo("redo")} />
                                )
                                    :
                                    (
                                        <FaVideo onClick={() => stopVideo("stop")} />
                                    )
                            }
                        </button>

                        <button className="control-btn">
                            <FaMicrophone />
                            {/* <FaMicrophoneSlash /> */}
                        </button>

                        <button className="control-btn bg-red-600">
                            <IoCall onClick={EndRTC} />
                        </button>
                    </div>
                </section>
            </main>
        </>
    )
}


export default Room