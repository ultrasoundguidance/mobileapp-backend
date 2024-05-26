import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'
import {doc, setDoc, getDoc} from 'firebase/firestore'
import 'dotenv/config'

// TODO: Replace the following with your app's Firebase project configuration
export const firebaseConfig = {
  apiKey: process.env.FB_KEY,
  authDomain: 'ultrasound-guidance.firebaseapp.com',
  projectId: 'ultrasound-guidance',
  storageBucket: 'ultrasound-guidance.appspot.com',
  messagingSenderId: '947728965057',
  appId: '1:947728965057:web:32b2bb26469a78c9762340',
  measurementId: 'G-DJ7GVQWM5Q',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Writes 6 digit passcode to users email address in Firebase.
 * @param {string} email Users email address.
 * @param {string} passcode The 6 digit passcode.
 * @param {string} expirationTime The time the passcode will expire.
 * @return {int} Status code of whether the item was written or not.
 */
export async function addPasscode(email, passcode, expirationTime) {
  try {
    await setDoc(doc(db, 'users', email), {
      mobileLogin: {
        passcode: passcode,
        expirationTime: expirationTime,
      },
    }, {merge: true})
    console.log('Added the passcode')
    return 200
  } catch (error) {
    console.log('Unable to add passcode: ', error)
    return 500
  }
}

/**
 * Sends email to email address with the 6 digit passcode.
 * @param {string} email Users email address.
 * @param {string} username Users first name.
 * @param {string} passcode The 6 digit passcode.
 */
export async function sendEmail(email, username, passcode) {
  const message = `
  Hi ${username},

  Ultrasound Guidance wants to make sure it's really you.
  Please enter the verification code when prompted.

  ${passcode}

  Your password will expire in 10 minutes.

  If you didn't request the code, please ignore this email.
  `

  try {
    await setDoc(doc(db, 'mail', email), {
      to: [email],
      message: {
        subject: 'Email Verification',
        text: message,
      },
    })
    console.log('Added the passcode')
    return 200
  } catch (error) {
    console.log('Unable to add passcode: ', error)
    return 500
  }
}

/**
 * Gets all data from users collections in Firebase using email address.
 * @param {string} email Users email address.
 * @return {object} The user data.
 */
export async function getUsers(email) {
  try {
    const docRef = doc(db, 'users', email)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!')
    }
  } catch (error) {
    console.error(`Unable to get item for email ${email}. Error: `, error)
    return 500
  }


  db.collection('users').doc(email).get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data().passcode
        } else {
          console.log(`No passcode for user email: ${email}`)
          return undefined
        }
      }).catch((error) => {
        console.error(`Unable to get item for email ${email}. Error: `, error)
        return 500
      })
}

/**
 * Gets all data from users collections in Firebase using email address.
 * @param {string} email Users email address.
 * @param {string} postId ID of the post from the website.
 * @param {number} progressPosition Current watch time divided by the duration.
 * @param {number} videoId Users email address.
 * @param {number} watchedSeconds Current watch time in seconds.
 * @param {number} videoCount The number of videos in a post.
 */
export async function addVideoProgress(
    email,
    postId,
    progressPosition,
    videoId,
    watchedSeconds,
    videoCount,
) {
  try {
    await setDoc(doc(db, 'users', email), {
      watchedVideosProgress: {
        [postId]: {
          [videoId]: {
            postId: postId,
            progressPosition: progressPosition,
            videoId: videoId,
            watchedSeconds: watchedSeconds,
          },
          videoCount: videoCount,
        },
      },
    }, {merge: true})
    console.log('Added video progress')
    return 200
  } catch (error) {
    console.log('Unable to add video progress: ', error)
    return 500
  }
}
