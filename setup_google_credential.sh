#!/bin/bash
#---------------------------------------------------------------------------#
# Backend requests to Firebase running on local server needs an file to     #
# specify the credentials used to perform the request. The created script   #
# creates a file on local_home, ecis-firebase-identity.json, which provides #
# the necessarily information, and export an environment variable to point  #
# the local file.                                                           #
#---------------------------------------------------------------------------#

FILE_NAME=ecis-firebase-identity.json

cp $FILE_NAME $HOME"/" 

echo "\n# The next line export the environment variable to identify Google Requests" >> ~/.bashrc
echo "export GOOGLE_APPLICATION_CREDENTIALS='"$HOME"/"$FILE_NAME"'" >> ~/.bashrc