import { useState, useContext, useEffect } from 'react'
import { SocketContext } from '../context/Socket'

function App() {
  const socket = useContext(SocketContext)

  useEffect(() => {

    socket.on('connect', () => {
      // alert("connected")
    })


  }, [socket])

  return (
    <main className='h-screen w-full flex items-center justify-center gap-3 flex-col'>
    <input type="text" placeholder='name' className='border-[1px] border-black' />
    <input type="text" placeholder='roomId' className='border-[1px] border-black'/>
      <button className='bg-blue-400 px-4'>Join , create room</button>
    </main>
  )
}

export default App
