import {onRequest} from 'firebase-functions/v2/https'
import {initializeApp} from 'firebase-admin/app'
import express from 'express'
import authRoutes from './routes/AuthRoutes.js'
import postRoutes from './routes/PostRoutes.js'
import videoRoutes from './routes/VideoRoutes.js'
import StripeWebhooks from './routes/StripeWebhooks.js'
import RCWebhooks from './routes/RCWebhooks.js'

initializeApp()

const app = express()

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/post', postRoutes)
app.use('/video', videoRoutes)
app.use('/stripe', StripeWebhooks)
app.use('/rc', RCWebhooks)
app.get('/', (req, res) => res.status(200).send('Function is up and running 👍'))

export const ug = onRequest(app)
