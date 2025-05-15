const express = require('express');
const http=require("http")
const app = express();
const {Server}=require("socket.io")
const server=http.createServer(app)
const PORT = process.env.PORT || 1111;

//middlewares
app.use(express.json());

const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
})

io.on("connection",(client)=>{
    console.log("client",client.id)

    client.on("joinRoom",({name,roomId})=>{
      console.log("joined rrom by",name)
      client.join(roomId)
      io.to(roomId).emit("joined_message",name)
    })
})

app.get('/', (req, res) => {
  res.send('Hello World');
});

server.listen(PORT, () => {
  console.log(`Server is running...`);
});