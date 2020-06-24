const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generatelocationMessage} = require('./utils/messages')
const {addUser, getUser, removeUser, getUsersInRoom} = require('./utils/users')

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
    
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options }) //spread operator

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        })

        callback()
    })
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            })
        }
    })

    socket.on('sendLocation', (coordinated, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generatelocationMessage(user.username, `https://google.com/maps/?q=${coordinated.latitude},${coordinated.longitude}`))
        callback()
    })
})
server.listen(port, () => {
    console.log('Server is up!! at ' + port)
})