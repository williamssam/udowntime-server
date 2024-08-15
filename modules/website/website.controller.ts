import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { fetchWebsite } from '../../utils/fetch-website'
import type {
	CreateWebsiteInput,
	DeleteWebsiteInput,
	GetAllWebsitesInput,
	GetWebsiteInput,
	UpdateWebsiteInput,
	UpdateWebsiteStatusInput,
} from './website.schema'
import { findWebsite } from './website.service'
import type { Website } from './website.types'

export const createWebsiteHandler = async (
	req: Request<unknown, unknown, CreateWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.user
		const { name, url, is_monitored } = req.body

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

		const resp = await fetchWebsite(url)
		const status = is_monitored ? 'monitored' : 'not-monitored'
		const average_response_time = 0

		const website = await db.query<Website>(
			'INSERT INTO websites (name, url, status, average_response_time, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[name, url, status, average_response_time, user.id]
		)

		if (is_monitored) {
			await db.query(
				'INSERT INTO website_history (website_id, user_id, status, status_code, response_time) VALUES ($1, $2, $3, $4, $5)',
				[
					website.rows.at(0)?.id,
					user.id,
					resp.status,
					resp.status_code,
					resp.response_time,
				]
			)
		}

		// website is not updated after trigger function runs when website is monitored, so we need to fetch it again
		const new_website = await db.query('SELECT * FROM websites WHERE id = $1', [
			website.rows.at(0)?.id,
		])

		res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'Website created successfully',
			data: new_website.rows.at(0),
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
		const { id } = req.params

		const website = await db.query(
			'SELECT id, name, url, downtime, availability, uptime, status, average_response_time, created_at, updated_at FROM websites WHERE id = $1',
			[id]
		)
		if (!website.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website fetched successfully',
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
		const { id } = req.params
		const { name } = req.body

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		const website = await db.query(
			'UPDATE websites SET name = $1 WHERE id = $2 RETURNING *',
			[name, id]
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
		const { id } = req.params

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		await db.query('DELETE FROM websites WHERE id = $1', [id])
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website deleted successfully',
		})
	} catch (error) {
		next(error)
	}
}

export const getAuthenticatedUserWebsitesHandler = async (
	req: Request<unknown, unknown, unknown, GetAllWebsitesInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.user
		const { status, page } = req.query

		const requested_page = Number(page) || 1
		// TODO: add pagination with limit and offset
		const websites = await db.query(
			'SELECT * FROM websites WHERE user_id = $1 ORDER BY created_at DESC',
			[user.id]
		)

		const total = websites.rowCount
		const limit = 15

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Websites fetched successfully',
			data: websites.rows,
			meta: {
				total,
				current_page: page,
				per_page: limit,
				// total_pages: Math.ceil(total / limit) || 1,
				// has_next_page: page < Math.ceil(total / limit),
				// has_prev_page: page > 1,
				// next_page: page + 1,
				// prev_page: page - 1 || 1,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const updateWebsiteStatusHandler = async (
	req: Request<
		UpdateWebsiteStatusInput['params'],
		unknown,
		UpdateWebsiteStatusInput['body']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { is_monitored } = req.body

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website not found!', HttpStatusCode.NOT_FOUND)
		}

		const status = is_monitored ? 'monitored' : 'not-monitored'

		const website = await db.query(
			'UPDATE websites SET status = $1 WHERE id = $2 RETURNING *',
			[status, id]
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website status updated successfully',
			data: website.rows.at(0),
		})
	} catch (error) {
		next(error)
	}
}

export const getWebsiteHistoryHandler = async (
	req: Request<GetWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.user
		const { id } = req.params

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
		}

		const website_histories = await db.query(
			'SELECT website_id, status, status_code, response_time, created_at, updated_at FROM website_history WHERE website_id = $1 AND user_id = $2 ORDER BY created_at DESC',
			[id, user.id]
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website history fetched successfully',
			data: website_histories.rows,
		})
	} catch (error) {
		next(error)
	}
}
