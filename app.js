const express = require('express');
const app = new express();
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
var exec = require('child_process').exec;

port = 3000
// cameraroll_path = '/private/var/mobile/Media/DCIM/100APPLE'
cameraroll_path = '~/Desktop'

app.get('/', function(request, response){
    response.sendFile( path.join(__dirname, 'index.html'));
});

// We can control the camera using activator
// see: http://junesiphone.com/actions/
var capture_img = function(){
    exec('activator send libactivator.lockscreen.toggle')
    exec('activator send com.apple.camera')
    exec('activator send libactivator.camera.invoke-shutter')
    exec('activator send libactivator.lockscreen.toggle')
}

// Populate image element with webcam each second
setInterval( () => {
    console.log('Updating image')
    capture_img()
    get_image()

    // fs.readFile(path.join(__dirname, 'out.jpg'), (err, buffer) => {  
    //     io.emit('image', {image: true, buffer: buffer.toString('base64') })
    // })
}, 1000)

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


