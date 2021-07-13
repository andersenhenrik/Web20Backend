# About 

This repository provides necessary files for the backend of the *Megafon* application.

# Getting started

Step by step guide and informations about how to setup the project.

## Prerequisites
The following software will be needed for running the project:
 - nodejs
> sudo apt-get install nodejs
- npm
> sudo apt-get install npm
- MongoDB
> sudo apt-get install mongodb

## Installation

 1. Change directory to */usr/local/node*
 2. Clone Git repository
 > git clone https://github.com/andersenhenrik/Web20Backend
 3. Install dependencies
 > npm install

## Ubuntu Service
To run backend as a background process register it as a systemd service:
1. Add a file in */etc/systemd/system/megafon.service with the following content:*
>[Unit]
Description=Megafon
After=network.target
[Service]
Type=simple
User=root
Group=root
LimitNOFILE=1000000
Environment=HOME=/home/root
Environment=LANGUAGE=en_US:en
Environment=LS_ALL=en_US.UTF-8
ExecStart=node /usr/local/node/Web20Backend/bin/www
Restart=always
RestartSec=5
Environment=LANG=en_US.UTF-8
SyslogIdentifier=megafon
[Install]
WantedBy=multi-user.target
2. Register the service:
> sudo systemctl enable megafon.service
3. Use systemctl to control the application:
> sudo systemctl {start,stop,status} megafon

Thanks to Junaid Farooq for the procedure! (https://askubuntu.com/questions/845334/start-not-found-for-job-in-etc-init-ubuntu)

## Database
This application works with a MongoDB database called *userdb* containing a single collection named *users*. All documents stored in *users* have the following signature: 

 - _id: 1337
 - email: "foo@bar.com"
 - password: "12345"
 - key: "1a2b3c4d5e"
 - mastUrl: "botsin.space"
 - mastToken: "z9y8x7"
 - twitterToken: "k3k3k3"
 - steemName: "username"
 - steemKey: "h4h4h4"

This structure is required for accessing the database via the api provided in */src/db_access.js*.

# Contact
Web2.0 Group 4
 - Laura Witthöft -- laura.witthoeft@uni-rostock.de
 - Alexandra Plein -- alexandra.plein@uni-rostock.de
 - Henrik Andersen -- henrik.andersen@uni-rostock.de
 - Clemens Richter -- clemens.richter@uni-rostock.de
 
 Related Links:
 - Project Link: https://github.com/andersenhenrik/Web20Backend
 - Frontend Repository: https://github.com/aplein97/Web20
