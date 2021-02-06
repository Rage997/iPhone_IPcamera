# Turn an old iphone into a camera webserver

The idea is to repurpose an old iphone as a wifi camera. To do so the iphone will record video using ffmpeg and then serve them on a node.js server.

# Installation

1. Jailbreak using checkrain to open ssh port and then run on one terminal:

```iproxy 44 23```
then open a new terminal and run:

```ssh root@localhost -p 44```

the default root password is <em>alpine</em>

After first ssh connection, I reccomend to change both root and mobile passwords for security.

2. Add https://mcapollo.github.io/Public/ and https://repo.packix.com/ to the Cydia sources

```echo "deb https://repo.packix.com/ ./" >> /var/mobile/Library/Caches/com.saurik.Cydia/sources.list```

```echo "deb https://mcapollo.github.io/Public/ ./" >> /var/mobile/Library/Caches/com.saurik.Cydia/sources.list```

3. Now you can install node, ffmpeg and git

apt install ffmpeg node

4. Clone this repo inside the iphone and start the webserver by running ```node app.js```

5. Done! Now you can connect on port 3000


# TODO
1. Unfortunately ffmpeg needs to get access granted to control the phone camera. I still haven't managed how to do that therefore this project can be considered incomplete.