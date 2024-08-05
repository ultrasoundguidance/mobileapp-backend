import {Router} from 'express'
import {GhostURL, ghostAdminApi} from '../clients/Ghost.js'
import {addPasscode, getUsers, sendEmail} from '../clients/FireStore.js'
import FormData from 'form-data'
import axios from 'axios'
import jwt from 'jsonwebtoken'

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

router.post('/createMember', async (req, res) => {
  const {name, email} = req.body
  try {
    await ghostAdminApi.members.add(
        {
          name: name,
          email: email,
          labels: [{'name': 'Mobile app signup', 'slug': 'mobile-app-signup'}],
        },
    )

    // Wait for welcome email to be sent before sending passcode email
    setTimeout(() => {
      return res.sendStatus(200)
    }, 5000)
  } catch (error) {
    console.log(error)
    return res
        .sendStatus(400)
        .json({error: 'Couldn\'t create member or member is already created'})
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

router.post('/addSubscriptionToGhost', async (req, res) => {
  const {userEmail, userName, userId} = req.body
  console.log(
      'Adding Subscription to Ghost for the email, name and user id: ',
      userEmail, userName, userId,
  )

  // Do not modify. All the information is needed
  // eslint-disable-next-line max-len
  const fileContents = `id,email,name,note,subscribed_to_emails,complimentary_plan,stripe_customer_id,labels
,${userEmail},${userName},added by Stripe,,FALSE,${userId},stripe integration`

  const form = new FormData()
  form.append('mapping[email]', 'email')
  form.append('mapping[name]', 'name')
  form.append('mapping[stripe_customer_id]', 'stripe_customer_id')
  form.append('membersfile', Buffer.from(fileContents), {filename: 'data.csv'})

  const key = process.env.GHOST_KEY
  const [id, secret] = key.split(':')
  const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: `/admin/`,
  })

  const headers = Object.assign({
    Authorization: `Ghost ${token}`,
  }, form.getHeaders())
  try {
    await axios.post(
        `${GhostURL}/ghost/api/admin/members/upload/`,
        form, {headers},
    )
    console.log('Associated Stripe subscription to Ghost member')
    res.sendStatus(200)
  } catch (error) {
    console.error(
        'Unable to associate Stripe subscription to Ghost member', error,
    )
    res.sendStatus(400)
  }
})

export default router
