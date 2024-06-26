import {Router} from 'express'
import {createSubscription} from '../clients/Stripe.js'

const router = new Router()

router.post('/revenueCatWebhook', async (req, res) => {
  const userId = req.body.event.app_user_id
  res.send('Called the RevenueCat Webhook')

  // Save this information to Stripe
  await createSubscription(userId)
})

export default router
