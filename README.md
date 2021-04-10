# Turn an old iphone into a camera webserver

The idea is to repurpose an old iPhone as a wifi camera. There are already many "Ip-Camera" application existing on the App Store, however, my goal was to install and control it through ssh. Moreover, this project was more a test on what is possible to do with an old iPhone. In the past year, I've been purchasing lots of broken iPhone and repaired them for profit but unfortunately, a good amount of them was blocked and forgotten by the previous owner (I always tried to contact them by email/phone but they always ignored me so I assume they don't care about it). I'm trying to figure out what to do with these blocked iPhones. This project is an idea on that and a test on the limitations of what is achievable.

# Installation

1. Jailbreak using checkrain and install Cydia. You can connect through ssh using usb connection by installing libusb (i.e. ```apt install libusb```) and then run:

```iproxy 23 44```

then open a new terminal and run:

```ssh root@localhost -p 23```

the default root password is <em>alpine</em>. After first ssh connection, I reccomend to change both root and mobile passwords for security and to update the repos.

```passwd root```

```passwd mobile```

```apt update && apt upgrade```

2. Install git and clone the repo.

```apt install git```

```git clone https://github.com/Rage997/iPhone_IPcamera.git && cd iPhone_IPcamera```


2. Install the dependencies. You can run <em>install_dependecies.sh</em>

```chmod 755 ./install_dependecies.sh && ./install_dependecies.sh```

3. Done! You can start the webserver by running ```node app.js``` and connect on port 3000. If you are using libusb you can run ```iproxy 3000 3000``` and then open the broswer http://localhost:3000/

# TODO
[x] Unfortunately ffmpeg needs to get access granted to control the phone camera. I still haven't managed how to do that therefore this project can be considered incomplete. -> Update: this has been done using activator to take pictures. However, to do so the iPhone screens has to be turned on. This is more a workaround rather than a solution.

[] Write a nice looking front-end
