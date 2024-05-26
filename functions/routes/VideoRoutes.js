import {Router} from 'express'
import {addVideoProgress, getUsers} from '../clients/FireStore.js'

const router = new Router()

router.post('/getVideoProgress', async (req, res) => {
  const {email} = req.body
  console.log('Email to get data for is: ', email)

  try {
    const response = await getUsers(email)
    return res.send(response.watchedVideosProgress)
  } catch (error) {
    console.log(error)
    res
        .status(400)
        .json({error: 'Couldn\'t get users watched videos'})
  }
})

router.post('/saveVideoProgress', async (req, res) => {
  const {
    email,
    postId,
    progressPosition,
    videoId,
    watchedSeconds,
    videoCount,
  } = req.body
  console.log(
      'Video progress data to save: ',
      email,
      postId,
      progressPosition,
      videoId,
      watchedSeconds,
      videoCount,
  )

  try {
    await addVideoProgress(
        email,
        postId,
        progressPosition,
        videoId,
        watchedSeconds,
        videoCount,
    )
    res.status(200).send('Saved video progress')
  } catch (error) {
    console.log(error)
    res
        .status(400)
        .json({error: 'Couldn\'t save video progress'})
  }
})

export default router
