import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { fetchWebsite } from '../../utils/fetch-website'
import type { CreateWebsiteInput } from './website.schema'

export const createWebsiteHandler = async (
	req: Request<unknown, unknown, CreateWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user_id } = req.query
		const { name, url } = req.body

		const urlExists = await db.query(
			'SELECT url FROM websites WHERE url = $1',
			[url]
		)
		if (urlExists.rows.length) {
			throw new ApiError(
				'Website with URL already exists.',
				HttpStatusCode.CONFLICT
			)
		}

		// visit website
		const resp = await fetchWebsite(url)

		const uptime = resp.status === 'available' ? 1 : 0
		const downtime = resp.status === 'available' ? 0 : 1
		const availability = (uptime / (uptime + downtime)) * 100

		// Calculate average response time
		const average_response_time = 0
		const last_check = Date.now()

		const website = await db.query(
			'INSERT INTO websites (name, url, status, uptime, downtime, availability, last_check, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
			[
				name,
				url,
				resp.status,
				uptime,
				downtime,
				availability,
				last_check,
				user_id,
			]
		)

		await db.query(
			'INSERT INTO website_history (website_id, status, status_code, response_time) VALUES ($1, $2, $3, $4) RETURNING *',
			[website.rows[0].id, resp.status, resp.status_code, resp.response_time]
		)

		res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'Website created successfully',
			data: website.rows.at(0),
		})
	} catch (error) {
		next(error)
	}
}
