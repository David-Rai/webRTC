import { useState, useContext, useEffect, useRef } from 'react'
import { SocketContext } from '../context/Socket'
import { useNavigate } from 'react-router-dom'

function App() {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const nameRef = useRef(null)
  const roomRef = useRef(null)

  //establishing the socket connection
  useEffect(() => {

    socket.on('connect', () => {
      console.log("connected ", socket.id)
    })

    //room created
    socket.on("created_room", ({ message, status, roomId }) => {
        navigate(`/room/${roomId}`)
    })


    //joined the room
    socket.on("joined_room",({message,name,roomId})=>{
      navigate(`/room/${roomId}`)
    })

    //if Room is full
    socket.on("full",message=>{
      alert(message)
    })
  }, [socket])

  //Handling the room join
  const handleJoin = () => {
    const name = nameRef.current.value
    const roomId = roomRef.current.value

    if (name.trim() === "" || roomId.trim() === "") {
      return alert("Field are required")
    }

    socket.emit("joinRoom", { name, roomId })

    // //clearing the input field
    // nameRef.current.value = ""
    // roomRef.current.value = ""

  }

  return (
    <main className='h-screen w-full flex items-center justify-center gap-3 flex-col bg-primary_bg'>
      <input type="text" placeholder='name' className='input' ref={nameRef} />
      <input type="text" placeholder='roomId' className='input' ref={roomRef} />
<div className='flex gap-4'>
<button className='bg-blue-400 btn' onClick={handleJoin}>Join Room</button>
<button className='bg-[#18BA69] btn ' onClick={handleJoin}>Create Room</button>
</div>
    </main>
  )
}

export default App
