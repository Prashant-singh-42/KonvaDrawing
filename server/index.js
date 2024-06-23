let express = require("express");
const { Socket } = require("socket.io");
let app = express();
let httpserver = require('http').createServer(app)

let PORT = process.env.PORT || 3000

let io = require('socket.io')(httpserver, {
    cors: true,
    origins: ["http://localhost:8080/"],
})

var connections = []

io.on('connect', (Socket) => {
    connections.push(Socket)
    console.log(`${Socket.id} has connected`)


    Socket.on('create a circle', (data) => {
        // Socket.broadcast.emit()
        console.log(data.points)
        console.log(data.currStroke)
        console.log(data.currentCol)
        // Socket.broadcast.emit('draw the circle', {points,currentCol,currStroke})
        connections.forEach( con => {
            if(con.id !== Socket.id){
                con.emit('draw the circle', {points: data.points,currentCol: data.currentCol,currStroke: data.currStroke})
            }
        })
    })

    Socket.on("make a line", (pevline) => {
        if(pevline){
        console.log(pevline)
        // console.log(typeof pevline)
        var mm = JSON.parse(pevline)
        console.log(mm.attrs)
        connections.forEach( con => {
            if(con.id !== Socket.id){
                con.emit('draw the line', mm.attrs)
            }
        })
    }
        
    })

    Socket.on('disconnect', () =>{
        connections = connections.filter((con) => con.id !== Socket.id)
        console.log(`${Socket.id} has disconnected`)
    })
})

httpserver.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})