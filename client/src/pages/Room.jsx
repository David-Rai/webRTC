import React, { useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";

const Room=()=>{
const socket=useContext(SocketContext)
const streamRef=useRef(null)
const [isRemote,setIsRemote]=useState(false)

//Getting the user stream at first
useEffect(async ()=>{
const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})
streamRef.current.srcObject=stream
},[])

    return (
        <>
        <main className="h-screen w-full bg-primary_bg">
            {/* <video></video> */}
        <video autoPlay playsInline ref={streamRef} className={` scale-x-[-1] ${isRemote ? "" : "h-screen w-full"}`}></video>
        </main>
        </>
    )
}


export default Room