import { db } from '../db'
import { sendEmail } from '../mail/mailer'
import type { Website } from '../modules/website/website.types'
import { fetchWebsite } from '../utils/fetch-website'

const FIVE_MINS_IN_MS = 5 * 60 * 1000

export const checkWebsites = async () => {
	const websites = await db.query<Website>(
		'SELECT url, user_id, id, updated_at FROM websites WHERE status = $1',
		['monitored']
	)

	if (!websites.rows.length) return

	for (const website of websites.rows) {
		try {
			const now = new Date().getTime()
			const updated = new Date(website.updated_at).getTime()

			if (now - updated > FIVE_MINS_IN_MS) {
				const user = await db.query('SELECT email FROM users WHERE id = $1', [
					website.user_id,
				])

				const resp = await fetchWebsite(website.url)
				await db.query(
					'INSERT INTO website_history (status, status_code, response_time, website_id, user_id) VALUES ($1, $2, $3, $4, $5)',
					[
						resp.status,
						resp.status_code,
						resp.response_time,
						website.id,
						website.user_id,
					]
				)

				if (!resp.ok) {
					await sendEmail({
						receiver: user.rows.at(0).email,
						subject: 'Website Unavailable',
						message: `The website ${website.url} is currently down/unavailable as at ${new Date(website.updated_at).toLocaleString()}. Please check it.`,
					})
				}
			}
		} catch (error) {
			console.error(error)
		}
	}
}
