const express = require("express");
const cors = require("cors");
const socket = require("socket.io");
require("./gmail.js");
require("./mongoose")

const app = express();

app.use(cors());

const http = require("http").createServer(app);

const socketio = socket(http,{
  cors:{
    accept:"*"
  }
})

socketio.on("connection", (socket) => {
       
  console.log(socket.handshake.query)

//  socket.join("1")


  socket.on("addMessage", (data) => {
    
    socketio.emit("recieveMessage", {
      ...data
    })
   
  })


      });
      



app.get("/", (req, res) => {
  socketio.emit("recieveMessage", {
    user: 1,
    message: "shuks"
  })

  res.send("hello")
});


app.use(require("./gmail_routes"));


http.listen("3000",()=> console.log("listening"))