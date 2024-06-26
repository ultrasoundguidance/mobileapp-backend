import {Router} from 'express'
import axios from 'axios'
import {createCustomer} from '../clients/Stripe.js'

const router = new Router()

router.post('/handleStripePurchase', async (req, res) => {
  const {data} = req.body
  const RevenueCatStripePublicAPIKey = process.env.RC_STRIPE_KEY
  const StripeCheckoutSessionID = data.object.id
  const appUserID = data.object.customer

  axios.post('https://api.revenuecat.com/v1/receipts', {
    app_user_id: appUserID,
    fetch_token: StripeCheckoutSessionID,
  }, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Platform': 'stripe',
      'Authorization': 'Bearer ' + RevenueCatStripePublicAPIKey,
    },
  })
      .then(console.log('Updated RevenueCat!'))
      .catch((error) => {
        console.log('There was an error updating RevenueCat: ', error)
      })

  res.send('Called handle stripe purchase endpoint')
})

router.post('/createStripeCustomer', async (req, res) => {
  const {email, name} = req.body
  try {
    const customer = await createCustomer(email, name)
    res.send(customer)
  } catch (error) {
    res
        .status(400)
        .json({error: `Could not create Stripe customer: ${error}`})
  }
})


export default router
