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

//options QS JS
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (msg) => {
    const html = Mustache.render(messageTemplete, {
        message_string: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('locationMessage', (url) => {
    console.log(url.url)
    const htmlLocation = Mustache.render($locationMessageTemplete, {
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', htmlLocation)
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

socket.emit('join', {username, room})