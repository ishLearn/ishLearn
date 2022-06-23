import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import Logger from '../utils/Logger'

export default class EmailService {
  static EMAIL_ADDRESS = process.env.EMAIL_ADDRESS
  static EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

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
