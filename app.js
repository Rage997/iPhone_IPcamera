const express = require('express');
const app = new express();
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
var exec = require('child_process').exec;

port = 3000

app.get('/', function(request, response){
    response.sendFile( path.join(__dirname, 'index.html'));
});

// TODO capture image using ffmpeg
// you can list the avaiable devices by: ffmpeg -f avfoundation -list_devices true -i ""
// in a iphone index 0 is the back camera and 1 the front camera
device_idx = 1
// then you can capture the camera by: ffmpeg -f avfoundation -i "1" -vframes 1 out.jpg
var capture_img = function(){
    exec('ffmpeg -y -f avfoundation -i "1" -vframes 1 out.jpg',
     function(error, stdout, stderr) {
        console.dir(stdout);
      });
}

// Populate image element with webcam each second
setInterval( () => {
    console.log('Updating image')
    capture_img()
    fs.readFile(path.join(__dirname, 'out.jpg'), (err, buffer) => {  
        io.emit('image', {image: true, buffer: buffer.toString('base64') })
    })
}, 1000)

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


