import React, { useEffect } from "react";
import { SocketContext } from "../../context/Socket";
import { useContext } from "react";

const Room=()=>{
const socket=useContext(SocketContext)

    return (
        <>
        this is room
        </>
    )
}


export default Room