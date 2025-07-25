npm install -g eas-cli

eas login 
- login to Expo account

eas init 
- create the project in the Expo account

eas build -p android --profile preview 
- build the project, a link will be shown that leads to the .apk file 

eas build -p ios --profile preview
- build for ios systems

after downloading the file, the app is installed

In the Settings page, the Token is the inventree access Token and the API Url is http://{ip from the computer running the inventree instance} both devices must be connected to the same network
