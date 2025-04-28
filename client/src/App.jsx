import { useState, useContext, useEffect } from 'react'
import { SocketContext } from '../context/Socket'

function App() {
  const socket = useContext(SocketContext)

  useEffect(() => {

    socket.on('connect', () => {
      alert("connected")
    })


  }, [socket])

  return (
    <>
      <h1>this is my app</h1>
    </>
  )
}

export default App
