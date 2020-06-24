const socket = io()

//elements
const $messageForm = document.querySelector('#form-msg')
const $messageFormInput = $messageForm.querySelector('#input')
const $messageFormButton = $messageForm.querySelector('#button')
const $shareLocation = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')
//templates
const messageTemplete = document.querySelector('#message-template').innerHTML
const $locationMessageTemplete = document.querySelector("#location-message").innerHTML
const $sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//options QS JS
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new last element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $newMessage.scrollHeight

    //How far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    //we were at the bottom
    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (msg) => {
    
    const html = Mustache.render(messageTemplete, {
        usernm: msg.username,
        message_string: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('locationMessage', (url) => {
    
    const htmlLocation = Mustache.render($locationMessageTemplete, {
        usernm: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', htmlLocation)
    autoScroll()
})
socket.on('roomData', ({room, users}) =>{
    const htmlSidebar = Mustache.render($sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = htmlSidebar
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = e.target.elements.input.value
    //there can be n number of messages as prameters
    socket.emit('sendMessage', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        
    })
})

$shareLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('browser not supported')
    }

    $shareLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log('Location shared')
            $shareLocation.removeAttribute('disabled')
        })

    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})