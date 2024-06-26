import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_PROD_KEY)
import 'dotenv/config'

/**
 * Create new customer in Stripe.
 * @param {string} email Users email address.
 * @param {string} name Users name.
 * @return {object} The Stripe customer.
 */
export async function createCustomer(email, name) {
  const customers = await stripe.customers.search({
    query: `email:'${email}'`,
  })

  console.log('found customers: ', customers)

  if (customers.data.length > 0) {
    return customers.data[0]
  } else {
    try {
      const customer = await stripe.customers.create({
        name: name,
        email: email,
      })
      return customer
    } catch (error) {
      console.log('Unable to create new Stripe customer: ', error)
      return 500
    }
  }
}

/**
 * Create new customer in Stripe.
 * @param {string} customerID Customers ID in Stripe.
 */
export async function createSubscription(customerID) {
  console.log('called CreateSubscription for Stripe')
  try {
    await stripe.subscriptions.create({
      customer: customerID,
      items: [
        {
          price: 'price_1PAZgqA9hXX96vb0kjIfeOZC', // $59.00 / year,
        },
      ],
      discounts: [{
        coupon: 'mobile-app-purchase', // 100% off once
      }],
    })

    return 200
  } catch (error) {
    return 500
  }
}
