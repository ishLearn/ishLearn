import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import Logger from '../utils/Logger'
import User from '../models/User'
import EmailToken from '../models/EmailToken'

export default class EmailService {
  static EMAIL_ADDRESS = process.env.EMAIL_ADDRESS
  static EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

  static actions = {
    pwdForgotten: 'passwordReset',
    confirmNewEmail: 'confirmNewEmail',
    confirmFirstEmail: 'confirmInitialEmail',
  }

  static getConnection() {
    if (
      typeof EmailService.EMAIL_ADDRESS === 'undefined' ||
      typeof EmailService.EMAIL_PASSWORD === 'undefined'
    )
      throw new Error(
        'Email address and password must be defined in environment.'
      )

    const options: SMTPTransport.Options = {
      host: 'ha01s012.org-dns.com',
      secure: true,
      port: 465,
      auth: {
        user: EmailService.EMAIL_ADDRESS,
        pass: EmailService.EMAIL_PASSWORD,
      },
    }
    return createTransport(options)
  }

  static verify(account: Transporter<SMTPTransport.SentMessageInfo>) {
    return new Promise((resolve, reject) => {
      account.verify((err, success) => {
        if (err) {
          reject(err)
          return
        }
        resolve(success)
      })
    })
  }

  /**
   * Send a mail to reset the password.
   * @param user The user to target
   * @returns Nothing
   */
  static async sendPwdForgottenEmail(user: User) {
    // Validate user is found in the DB
    if (typeof user.id === 'undefined') throw new Error('User was not found')

    // Generate a new Email token and save it to DB
    const newToken = await EmailToken.getNewToken(
      user.id,
      EmailService.actions.pwdForgotten
    )

    // get redirect URL
    // TODO: Implement Frontend route to /callback/:token
    const redirectURL = `${process.env.BASE_URL}/callback/${newToken.token}`

    // HTML-content of the Email
    const htmlMessage = `
      Hier können Sie Ihr Passwort zurücksetzen: <a>${redirectURL}</a>
    `
    // Send the email
    return await EmailService.sendEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      'Passwort zurücksetzen',
      htmlMessage
    )
  }

  /**
   * Send a mail to reset the password.
   * @param user The user to target
   * @returns Nothing
   */
  static async sendConfirmAddressEmail(user: User, initial: boolean = true) {
    // Validate user is found in the DB
    if (typeof user.id === 'undefined') throw new Error('User was not found')

    // Generate a new Email token and save it to DB
    const newToken = await EmailToken.getNewToken(
      user.id,
      EmailService.actions.confirmNewEmail
    )

    // get redirect URL
    // TODO: Implement Frontend route to /callback/:token
    const redirectURL = `${process.env.BASE_URL}/callback/${newToken.token}`

    // HTML-content of the Email
    const htmlMessage = `
      Hier können Sie Ihre${
        initial && ' neue'
      } E-Mail bestätigen: <a>${redirectURL}</a>
    `
    // Send the email
    return await EmailService.sendEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      'E-Mail-Adresse Bestätigen',
      htmlMessage
    )
  }

  static sendEmail(
    recipient: string,
    recipientName: string,
    subject: string,
    message: string
  ) {
    return new Promise<SMTPTransport.SentMessageInfo>(
      async (resolve, reject) => {
        const c = this.getConnection()

        try {
          await EmailService.verify(c)

          c.sendMail(
            {
              from: 'ishlearn@sthomas.ch',
              // from: 'ISHLearn <ishlearn@sthomas.ch>',
              to: `${recipientName} <${recipient}>`,
              subject,
              html: message,
              envelope: {
                from: 'Test <ishlearn@sthomas.ch>',
                to: `${recipientName} <${recipient}>`,
              },
            },
            (err, info) => {
              console.log('Mail sent')
              if (err) return reject(err)
              return resolve(info)
            }
          )
        } catch (err) {
          new Logger().error('E-Mail Sending', 'Verifying and sending', err)
        }
      }
    )
  }
}
