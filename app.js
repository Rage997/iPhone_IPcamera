const express = require('express');
const app = new express();
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const fs = require('fs')
const moment= require('moment') 
var exec = require('child_process').exec;

port = 3000
cameraroll_path = '/private/var/mobile/Media/DCIM/100APPLE'

interval = 1 // seconds to pass between two pictures
keep_open = false // flag to keep the camera open or close it

app.get('/', function(request, response){
    response.sendFile( path.join(__dirname, 'index.html'));
});

//todo send video if available
app.get('/download', function(request, response){
    fs.access('./video.mp4', fs.F_OK, (err) => {
        if (err) {
            console.error(err)
            response.writeHead(400, {"Content-Type": "text/plain"});
            response.end("ERROR File does not exist");
            return
        }
            response.sendFile( path.join(__dirname, 'video.mp4'));
      })
});

// We can control the camera using activator
// see: http://junesiphone.com/actions/
// not the best solution because the device will unlock to take a photo but it's the best I managed to do
var capture_img = function(){
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
var update_last_image = async function( ){
    await capture_img(keep_open=keep_open)
    fs.readdir(path.resolve(cameraroll_path),function(err, list){
        if(err){
            console.error(err)
            return
        }

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
    
    if (newest_file != null){
        console.log('Updating newest picture')
        image = newest_file
        fs.readFile(image, (err, buffer) => {  
            if (err) throw err;
            io.emit('image', {image: true, buffer: buffer.toString('base64') })
    })
    }
}

// Convert all the images into a video using ffmpeg
var convert_video = function(callback){
    console.log('Converting images into daily video')
    exec("ffmpeg -framerate 1 -pattern_type glob -i '/private/var/mobile/Media/DCIM/100APPLE/*.JPG' -vf scale='1280:-2'  -c:v libx264 -r 30 -pix_fmt yuv420p video.mp4")
    callback()
}

// Deletes all images
var clean = function(){
    newest_file = null
    console.log('Cleaning gallery')
    exec('rm /private/var/mobile/Media/DCIM/100APPLE/*')
    exec('rm -rf /private/var/mobile/Media/Photos/*')
    // exec('rm -rf /private/var/mobile/Media/PhotoData/*')
}
// Populate image element with webcam each second
setInterval( () => {
    keep_open = (interval < 10) ? true : false    
    update_last_image()
}, interval*1000)


// At midnight: create a video of the day and delete all images
setTimeout(
    ()=>{
        console.log('Cleaning old images and creating daily video')
        convert_video(clean)
    },
    moment("24:00:00", "hh:mm:ss").diff(moment(), 'seconds')
 );


server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  })


