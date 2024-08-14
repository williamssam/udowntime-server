import { db } from '../db'
import type { Website } from '../modules/website/website.types'
import { fetchWebsite } from '../utils/fetch-website'

const checkWebsite = async () => {
	const websites = await db.query<Website>(
		'SELECT url, uptime, downtime FROM websites WHERE is_monitored = true'
	)
	if (!websites.rows.length) return

	for (const website of websites.rows) {
		try {
			const resp = await fetchWebsite(website.url)

			await db.query(
				'UPDATE website_history SET status = $1, status_code = $2, response_time = $3 WHERE website_id = $4',
				[resp.status, resp.status_code, resp.response_time, website.id]
			)

			if (!resp.ok) {
				// notify user of downtime here
			}
		} catch (error) {
			console.error(error)
		}
	}
}
