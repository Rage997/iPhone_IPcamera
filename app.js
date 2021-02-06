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
    console.log('Taking picture')
    if (keep_open == true){
        exec('activator send libactivator.camera.invoke-shutter')
    }else{
        exec("activator send libactivator.lockscreen.toggle && \
        sleep 5 && \
        activator send com.apple.camera && \
        sleep 3 && \
        activator send libactivator.camera.invoke-shutter && \
        sleep 5 && \
        activator send libactivator.lockscreen.toggle")
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
    exec("ffmpeg -y -framerate 1 -i ${cameraroll_path}/*.JPG -r 5 -c:v libx264 -pix_fmt yuv420p ./video.mp4")
}

// Deletes all images
var clean = function(){
    exec('rm /private/var/mobile/Media/DCIM/100APPLE/*')
    exec('rm -rf /private/var/mobile/Media/Photos')
    exec('rm -rf /private/var/mobile/Media/PhotoData')
}

interval = 5 // seconds 
// Populate image element with webcam each second
setInterval( () => {
    if (interval < 10){
        capture_img(keep_open=true)        
    }else{
        capture_img(keep_open=false)
    }
    
    get_last_image()
    if (newest_file != null){
        console.log('Updating newest picture')
        image = newest_file
        fs.readFile(image, (err, buffer) => {  
            if (err) throw err;
            io.emit('image', {image: true, buffer: buffer.toString('base64') })
    })
    }

}, interval*1000)

// At midnight: create a video of the day and delete all images
setTimeout(
    ()=>{
        convert_video()
        clean()  
    },
    moment("24:00:00", "hh:mm:ss").diff(moment(), 'seconds')
 );


server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


