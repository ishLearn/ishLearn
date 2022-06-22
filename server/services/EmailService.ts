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
  }

  static sendEmail(recipient: string, subject: string, message: string) {
    const c = this.getConnection()
    return c.send(recipient, subject, message)
  }
}
