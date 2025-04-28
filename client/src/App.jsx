import { useState } from 'react'
import {io} from 'socket.io-client'

function App() {
const client=io("http://localhost:1111")

client.on("connect",()=>{
  alert("connected")
})


  return (
    <>
    <h1>this is my app</h1>
    </>
  )
}

export default App
