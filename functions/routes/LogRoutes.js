import {Router} from 'express'

const router = new Router()

router.post('/', (req, res) => {
  const {
    level,
    message,
    timestamp,
    data,
  } = req.body

  console.log('Frontend Logs: ', level, message, data, timestamp)
  res.sendStatus(200)
})

export default router
