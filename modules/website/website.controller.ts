import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { fetchWebsite } from '../../utils/fetch-website'
import type {
	CreateWebsiteInput,
	DeleteWebsiteInput,
	GetWebsiteInput,
	UpdateWebsiteInput,
} from './website.schema'
import { findWebsite } from './website.service'

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

export const getWebsiteHandler = async (
	req: Request<GetWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { website_id } = req.params

		const website = await findWebsite(website_id)
		if (!website.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website found successfully',
			data: website.rows.at(0),
		})
	} catch (error) {
		next(error)
	}
}

export const updateWebsiteHandler = async (
	req: Request<
		UpdateWebsiteInput['params'],
		unknown,
		UpdateWebsiteInput['body']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { website_id } = req.params
		const { name } = req.body

		const websiteExists = await findWebsite(website_id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		const website = await db.query(
			'UPDATE websites SET name = $1 WHERE id = $2 RETURNING *',
			[name, website_id]
		)

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website updated successfully',
			data: website.rows.at(0),
		})
	} catch (error) {
		next(error)
	}
}

export const deleteWebsiteHandler = async (
	req: Request<DeleteWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { website_id } = req.params

		const websiteExists = await findWebsite(website_id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		await db.query('DELETE FROM websites WHERE id = $1', [website_id])
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website deleted successfully',
		})
	} catch (error) {
		next(error)
	}
}
