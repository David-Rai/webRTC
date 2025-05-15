import { useState, useContext, useEffect, useRef } from 'react'
import { SocketContext } from '../context/Socket'

function App() {
  const socket = useContext(SocketContext)
  const nameRef = useRef(null)
  const roomRef = useRef(null)

  //establishing the socket connection
  useEffect(() => {

    socket.on('connect', () => {
      console.log("connected ", socket.id)
    })

    socket.on("joined_message",name=>{
      console.log(`${name} just joined the room`)
    })
  }, [socket])

  //Handling the room join
  const handleJoin = () => {
    const name = nameRef.current.value
    const roomId = roomRef.current.value

    socket.emit("joinRoom", { name, roomId })

    //clearing the input field
    nameRef.current.value = ""
    roomRef.current.value = ""

  }

  return (
    <main className='h-screen w-full flex items-center justify-center gap-3 flex-col'>
      <input type="text" placeholder='name' className='border-[1px] border-black' ref={nameRef} />
      <input type="text" placeholder='roomId' className='border-[1px] border-black' ref={roomRef} />
      <button className='bg-blue-400 px-4' onClick={handleJoin}>Join , create room</button>
    </main>
  )
}

export default App
