import {Router} from 'express'
import {ghostAdminApi} from '../clients/Ghost.js'

const router = new Router()

router.post('/getPost', async (req, res) => {
  ghostAdminApi.posts.read({id: '61bdf7782c1fc8004884fdcb'})
      .then((response) => {
        res.send(response)
      })
      .catch((error) => {
        console.log(error)
        res.send('No posts found')
      })
})

router.post('/getPublishedPosts', async (req, res) => {
  const filterTag = `tag: ${req.body.tag}`
  const filterPublished = `status: published`
  ghostAdminApi.posts.browse(
      {filter: `${filterTag}+${filterPublished}`, limit: 'all'},
  )
      .then((response) => {
        res.send(response)
      })
      .catch((error) => {
        console.log(error)
        res.send('No posts found')
      })
})

export default router
