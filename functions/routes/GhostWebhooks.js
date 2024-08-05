/* eslint-disable max-len */
import {Router} from 'express'
import {sendEmail} from '../clients/FireStore.js'

const router = new Router()

router.post('/sendWelcomeEmailToNewSubscriber', async (req, res) => {
  const {member} = req.body

  // Check if they were previously a free member
  if (member.previous.status === 'free') {
    const subject = '👋 Thank you for joining Ultrasound Guidance!'
    const message = `
    <p>Hi ${member.current.name},</p>
    <p>We're happy to see you've subscribed to <strong>Ultrasound Guidance</strong>!</p>

    <p>If you <strong>need support or have questions</strong>, please email team@ultrasoundguidance.com.</p>
    <p>Don't hesitate to send us an email with any questions, comments, or concerns. We're here to help!
    If you like what you see, give us a 1-3 sentence review on the app store or send send the review our way. We always love to hear your thoughts!</p>
    <hr>
    <p>Access the <strong>Diagnostic and Procedure Atlases</strong> by visiting the website at www.ultrasoundguidance.com/videos/
    and take all content with you on the mobile app.</p>

    <div>
      <div>
        <a href="https://apps.apple.com/us/app/ultrasound-guidance/id6502961815"><img alt="Download on the App Store" src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1602201600" style="border-radius: 13px; width: 185px; margin-left: 13px;"></a>
      </div>
      <a href="https://play.google.com/store/apps/details?id=com.ultrasoundguidanceorg.ultrasoundguidance"><img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" style="width: 210px; "></a>
    </div>

    <p>For frequently asked questions visit our <a href="https://www.ultrasoundguidance.com/contact/">contact and questions</a> page or reach out to team@ultrasoundguidance.com.</p>

    <p>Thank you,</br>
    Ultrasound Guidance</p>
    `

    sendEmail(member.current.email, subject, message)
  }
})

router.post('/sendWelcomeEmailToFreeMobileMember', async (req, res) => {
  const {member} = req.body

  // Send welcome email to free mobile app sign ups
  if (member.current.labels.find((item) => item.name === 'Mobile app signup')) {
    const subject = '👋 Welcome to Ultrasound Guidance!'
    const message = `
    <p>Hi ${member.current.name},</p>
    <p>Thank you for registering with <strong>Ultrasound Guidance</strong>! We're so glad you're here!</p>

    <p>The free tier of Ultrasound Guidance gives you access to a few introductory videos so you can get a feel for what we're all about. We hope you like what you see! When you're ready to level up your ultrasound skills, check out the <a href="https://www.ultrasoundguidance.com/plans/">MSK Complete Package</a> and see how you can improve your Ultrasound expertise!</p>
    
    <p>Please check out our <a href="https://www.ultrasoundguidance.com/contact/">frequently asked questions page</a> and reach out to team@ultrasoundguidance.com for any additional questions.</p>
    
    <p>Thank you,</br>
    Ultrasound Guidance</p>
    `

    sendEmail(member.current.email, subject, message)
  }
})


export default router
