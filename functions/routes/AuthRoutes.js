import {Router} from 'express'
import {ghostAdminApi} from '../clients/Ghost.js'
import {addPasscode, getUsers, sendEmail} from '../clients/FireStore.js'

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10

const router = new Router()

const generateEmailPasscode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post('/validateEmail', async (req, res) => {
  const emailFilter = `email: ${req.body.email}`
  console.log('got email: ', emailFilter)
  ghostAdminApi.members.browse({filter: emailFilter})
      .then((response) => {
        res.send(response)
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
        res.send('Cannot find user')
      })
})

router.post('/sendEmailPasscode', async (req, res) => {
  const {email, username} = req.body
  const emailPasscode = generateEmailPasscode()
  const expirationTime = new Date(
      new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
  ).toUTCString()

  if (email !== 'dev@testing.com') {
    try {
      await addPasscode(email, emailPasscode, expirationTime)
      await sendEmail(email, username, emailPasscode)
    } catch (error) {
      console.log(error)
      return res
          .status(400)
          .json({error: 'Couldn\'t start the authentication process'})
    }
  }
  return res.status(200).send('Saved passcode')
})

router.post('/verifyEmailPasscode', async (req, res) => {
  const {email, passcode} = req.body
  console.log('Email and Passcode to check is: ', email, passcode)

  try {
    const response = await getUsers(email)
    if (response.mobileLogin.passcode === passcode) {
      // Passcodes match
      const expirationTime = new Date(response.mobileLogin.expirationTime)
      const currentTime = new Date(new Date().getTime())
      if (expirationTime > currentTime) {
        console.log('Passcode is valid in time period')
        return res.sendStatus(200)
      } else {
        console.log('Passcode is not valid in time period')
        return res.status(401).json({error: 'Token expired!'})
      }
    } else {
      // Passcodes don't match
      return res.sendStatus(401)
    }
  } catch (error) {
    console.log(error)
    return res
        .status(400)
        .json({error: 'Couldn\'t get users passcode'})
  }
})

export default router
