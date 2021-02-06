const express = require('express');
const app = new express();
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
var exec = require('child_process').exec;

port = 3000
cameraroll_path = '/private/var/mobile/Media/DCIM/100APPLE'

app.get('/', function(request, response){
    response.sendFile( path.join(__dirname, 'index.html'));
});

// We can control the camera using activator
// see: http://junesiphone.com/actions/
// not the best solution because the device will unlock to take a photo but it's the best I managed to do
var capture_img = function(keep_open=false){
    if (keep_open == true){
        exec('activator send libactivator.camera.invoke-shutter')
    }
    else{
        exec('activator send libactivator.lockscreen.toggle')
        exec('activator send com.apple.camera')
        exec('activator send libactivator.camera.invoke-shutter')
        exec('activator send libactivator.lockscreen.toggle')
    }
}

// Gets the most recent image
newest_time = null
newest_file = null
var get_last_image = function( ){
    fs.readdir(path.resolve(cameraroll_path),function(err, list){
        list.forEach(function(file){
            file = path.resolve(path.join(cameraroll_path, file))
            const {birthtime} = fs.statSync(file);
            file_date = new Date(birthtime)
            if (!newest_time){
                newest_time = file_date
            }

            if (file_date > newest_time) {
                newest_time = file_date
                newest_file = file
            }
        })
    console.log('newest', newest_file)
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

interval = 3 * 1000 // 30 minutes 
// Populate image element with webcam each second
setInterval( () => {
    console.log('Taking picture')
    capture_img()
    get_last_image()
    if (newest_file != null){
        console.log('Updating newest picture')
        image = newest_file
        console.log('diocane immage', image)
        fs.readFile(image, (err, buffer) => {  
            io.emit('image', {image: true, buffer: buffer.toString('base64') })
    })
    }
    
}, interval)

server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


