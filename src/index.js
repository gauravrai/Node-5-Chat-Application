const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generatelocationMessage} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)//because express crates behind the screnes and we dont have access


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//socket.emit specific cleint
//io.emit every connected client
//socket.broadcast.emit every connected client except sender
//rooms cases
//io.to(room).emit every connected user in a room
//socket.broadcast.to(room).emit every connected user in a room except sender

//let count = 0
io.on('connection', (socket) => {
    console.log('new websocket connection')
    
    
    socket.on('join', ({username, room}) => {
        socket.join(room)
        socket.emit('message', generateMessage('Welcome'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} joined`))
    })
    socket.on('sendMessage', (msg, callback) => {

        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to('z').emit('message', generateMessage(msg))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User has left'))
    })

    socket.on('sendLocation', (coordinated, callback) => {
        io.emit('locationMessage', generatelocationMessage(`https://google.com/maps/?q=${coordinated.latitude},${coordinated.longitude}`))
        callback()
    })
})
server.listen(port, () => {
    console.log('Server is up!! at ' + port)
})