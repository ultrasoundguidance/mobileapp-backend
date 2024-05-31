## Setup
The backend for the Ultrasound Guidance mobile app uses Firebase Functions. You can read the get started guide [here](https://firebase.google.com/docs/functions/get-started?gen=2nd)
- Make sure you have Node.js, and the Firebase CLI installed
- Setup a '.env' file in the functions directory for the Firebase and Ghost API keys. The file should have the following keys:
```
GHOST_KEY = <Ghost Admin API key> // Obtained from integrations section of Ghost dashboard
FB_KEY = <Firebase Key> 
```

## Development
The [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) allows you to build and test apps on your local machine. Use the command `firebase emulators:start`. 
- Go to the functions URL to test code. For example http://127.0.0.1:5001/ultrasound-guidance/us-central1/ug/`<endpoint>`

## Deploying
`firebase deploy --only functions`