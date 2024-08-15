import { SMTPClient } from 'emailjs'
import { config } from '../config'
import { IS_PROD } from '../utils/constant'

const client = new SMTPClient({
	user: config.smtp_user,
	password: config.smtp_pass,
	host: config.smtp_host,
	ssl: IS_PROD,
})

type SendEmailParams = {
	receiver: string
	message: string
	subject: string
}

export const sendEmail = async ({
	message,
	receiver,
	subject,
}: SendEmailParams) => {
	client.send(
		{
			from: 'udowntime <udowntime@udowntime.com>',
			to: receiver,
			subject: subject,
			text: message,
		},
		(err: Error | null, message) => {
			if (err) {
				console.log('Error sending email:', err)
			} else {
				console.log('Email successfully sent:', message)
			}
		}
	)
}