import {Router} from 'express'
import {createSubscription} from '../clients/Stripe.js'

const router = new Router()

router.post('/revenueCatWebhookAndroid', async (req, res) => {
  const userId = req.body.event.app_user_id
  res.send('Called the RevenueCat Webhook - Android')

  // Save this information to Stripe
  await createSubscription(userId)
})

router.post('/revenueCatWebhookApple', async (req, res) => {
  const userId = req.body.event.app_user_id
  res.send('Called the RevenueCat Webhook - Apple')

  // Save this information to Stripe
  await createSubscription(userId)
})

export default router
