const express = require('express');
const http = require("http")
const app = express();
const { Server } = require("socket.io")
const server = http.createServer(app)
const PORT = process.env.PORT || 1111;
const cors = require("cors")

//middlewares
app.use(express.json());
app.use(cors({
  origin: [
    "https://david-webrtc.netlify.app", "https://david-webRTC.netlify.app/"
    , "http://localhost:5173/", "http://localhost:5173"
  ]
}))

const io = new Server(server, {
  cors: {
    origin: [
      "https://david-webrtc.netlify.app", "https://david-webRTC.netlify.app/",
      , "http://localhost:5173/", "http://localhost:5173"
    ]
  }
})


//SOCKET CONNECTION HANDLING
io.on("connection", (client) => {
  console.log("client", client.id)

  //JOINING AND CREATING THE ROOM
  client.on("joinRoom", ({ name, roomId }) => {
    const clients = io.sockets.adapter.rooms.get(roomId)
    const numClients = clients ? clients.size : 0;


    //creating the room
    if (numClients === 0) {
      client.join(roomId)
      console.log("created_room", roomId)
      client.emit("created_room", { message: "successfull created the room", status: true, roomId })
    } else
      if (numClients === 1) {
        client.join(roomId)
        client.emit("joined_room", { message: "joined room", name, roomId })
        client.to(roomId).emit("ready", "lets goo")
        console.log("joined the room", roomId)
      } else {
        console.log("room fulled")
        client.emit("full", "room is full")
      }

  })

  //Getting the SDP offer
  client.on("offer", ({ offer, roomId }) => {
    console.log("offered")
    client.to(roomId).emit("send_offer", offer)
  })

  //Getting the SDP answer
  client.on("answer", ({ answer, roomId }) => {
    console.log("answered")
    client.to(roomId).emit("send_answer", answer)
  })

  //Getting the new ice Candidate
  client.on("ice", ({ candidate, roomId }) => {
    client.to(roomId).emit("ice", candidate)
  })

})

//EXPRESS ROUTING
app.get('/', (req, res) => {
  res.send('Hello World');
});

server.listen(PORT, () => {
  console.log(`Server is running...`);
});
