import {Router} from 'express'
import {ghostAdminApi} from '../clients/Ghost.js'
import {
  addPasscode,
  getUsers,
  sendEmail,
  addMobileDeviceId,
  deleteMobileDeviceId,
} from '../clients/FireStore.js'

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10

const router = new Router()

const generateEmailPasscode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post('/validateMembership', async (req, res) => {
  ghostAdminApi.members.browse({filter: `email: '${req.body.email}'`})
      .then((response) => {
        res.send(response)
      })
      .catch((error) => {
        console.log(error)
        res.status(400).json({error: 'Cannot find user'})
      })
})

router.post('/mobileLogin', async (req, res) => {
  const {email, deviceId} = req.body
  // Users are only allowed 2 signed in devices at a time
  await addMobileDeviceId(email, deviceId)
  const user = await getUsers(email)
  if (user.mobileLogin.deviceIds.length > 2) {
    await deleteMobileDeviceId(email, user.mobileLogin.deviceIds[0])
  }

  res.sendStatus(200)
})

router.post('/validateDeviceId', async (req, res) => {
  const {email, deviceId} = req.body
  // Check if the device id given is included in the device id list for the user
  const user = await getUsers(email)
  if (user.mobileLogin.deviceIds.includes(deviceId)) {
    res.status(200).send('Device ID found')
  } else {
    res.status(404).send('Device ID not found')
  }
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
      const message = `
        <p>Hi ${username},</p>

        <p>Ultrasound Guidance wants to make sure it's really you.
        Please enter the verification code when prompted.</p>

        <p style="font-size: 30px;">${emailPasscode}</p>

        <p><strong>Your password will expire in 10 minutes.</strong></p>

        <p>If you didn't request the code, please ignore this email.</p>
        `
      const subject = '🔐 Email Verification'
      await sendEmail(email, subject, message)
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
        res.send('Valid Passcode')
      } else {
        console.log('Passcode is not valid in time period')
        return res.status(401).json({error: 'Token expired!'})
      }
    } else {
      // Passcodes don't match
      console.log('Passcodes do not match')
      res.sendStatus(401)
    }
  } catch (error) {
    console.log(error)
    return res
        .status(400)
        .json({error: 'Couldn\'t get users passcode'})
  }
})

router.post('/deleteMember', async (req, res) => {
  const {id} = req.body
  try {
    await ghostAdminApi.members.delete({id: id})
    return res.sendStatus(200)
  } catch (error) {
    console.log(error)
    return res
        .sendStatus(400)
        .json({error: 'Couldn\'t delete member'})
  }
})

export default router
