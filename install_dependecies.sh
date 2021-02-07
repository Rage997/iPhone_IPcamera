#!/bin/bash

apt install nodejs libactivator ffmpeg
killall SpringBoard
sleep 15
npm i
killall SpringBoard
echo 'Done! Start the server by running: \n node app.js \n and then connect on port 3000'