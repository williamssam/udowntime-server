import { db } from '../../db'

export const findWebsite = async (id: string) => {
	return await db.query('SELECT id FROM websites WHERE id = $1', [id])
}

export const getTotalWebsites = async () => {
	const resp = await db.query<{ count: string }>(
		'SELECT COUNT(*) FROM websites'
	)
	return Number(resp.rows.at(0)?.count)
}

export const getTotalWebsiteHistory = async (
	website_id: string,
	user_id: string
) => {
	const resp = await db.query<{ count: string }>(
		'SELECT COUNT(*) FROM website_history WHERE website_id = $1 AND user_id = $2',
		[website_id, user_id]
	)
	return Number(resp.rows.at(0)?.count)
}