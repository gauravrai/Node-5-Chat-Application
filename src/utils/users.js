const users = []

const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })

    //Validate username
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    //Store User
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    //used short hand for comparision and it return t or f by default
    const index = users.findIndex((user) => user.id === id )

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id ) //shorthadn
}

const getUsersInRoom = (room) => {
    //return true if item is to be considered and false if not (filtered out)
    return users.filter((user) => user.room === room )
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}