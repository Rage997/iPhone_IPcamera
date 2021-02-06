const express = require('express');
const app = new express();
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
var exec = require('child_process').exec;

port = 3000
// cameraroll_path = '/private/var/mobile/Media/DCIM/100APPLE'
cameraroll_path = '/Users/pietrobianco/Desktop'

app.get('/', function(request, response){
    response.sendFile( path.join(__dirname, 'index.html'));
});

// We can control the camera using activator
// see: http://junesiphone.com/actions/
// not the best solution because the device will unlock to take a photo but it's the best I managed to do
var capture_img = function(option){
    if (option.keep_open == false){
    exec('activator send libactivator.lockscreen.toggle')
    exec('activator send com.apple.camera')
    exec('activator send libactivator.camera.invoke-shutter')
    exec('activator send libactivator.lockscreen.toggle')
    }
    else{
        exec('activator send libactivator.camera.invoke-shutter')
    }
}

// Gets the most recent image
oldest_time = null
oldest_file = null
var get_last_image = function( ){
    fs.readdir(path.resolve(cameraroll_path),function(err, list){
        list.forEach(function(file){
            file = path.resolve(path.join(cameraroll_path, file))
            const {birthtime} = fs.statSync(file);
            file_date = new Date(birthtime)
            if (!oldest_time){
                oldest_time = file_date
            }

            if (file_date < oldest_time) {
                oldest_time = file_date
                oldest_file = file
            }
        })
    console.log('oldest', oldest_file)
    })
}

// Convert all the images into a video using ffmpeg
var convert_video = function(){
    exec("ffmpeg -framerate 1 -pattern_type glob -i '${cameraroll_path}/*.jpg' video.mp4")
}

// Deletes all images
var clean = function(){
    exec('rm /private/var/mobile/Media/DCIM/100APPLE/*')
    exec('rm -rf /private/var/mobile/Media/Photos')
    exec('rm -rf /private/var/mobile/Media/PhotoData')
}

interval = 30 * 1000 // 30 minutes 
// Populate image element with webcam each second
setInterval( () => {
    console.log('Updating image')
    // capture_img()
    get_last_image()
    if (oldest_file != null){
        image = oldest_file
    fs.readFile(path.join(__dirname, 'out.jpg'), (err, buffer) => {  
        io.emit('image', {image: true, buffer: buffer.toString('base64') })
    })
    }
    
}, interval)

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


