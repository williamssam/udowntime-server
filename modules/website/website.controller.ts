import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { fetchWebsite } from '../../utils/fetch-website'
import type {
	CreateWebsiteInput,
	DeleteWebsiteInput,
	GetAllWebsitesInput,
	GetWebsiteHistoryInput,
	GetWebsiteInput,
	UpdateWebsiteInput,
	UpdateWebsiteStatusInput,
} from './website.schema'
import {
	findWebsite,
	getTotalWebsiteHistory,
	getTotalWebsites,
} from './website.service'
import type { Website, WebsiteReport } from './website.types'

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

		const website = await db.query<Website>(
			'INSERT INTO websites (name, url, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
			[name, url, status, user.id]
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

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
		}

		const website = await db.query(
			'SELECT id, name, url, status, created_at, updated_at FROM websites WHERE id = $1',
			[id]
		)

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
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
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
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
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
		const { status: requested_status, page: requested_page } = req.query

		const limit = 15
		const page = Number(requested_page) || 1
		const status = requested_status ?? null

		const websites = await db.query(
			`
			SELECT id, name, url, status, created_at, updated_at FROM websites WHERE user_id = $1 AND (cast($2 AS TEXT) IS NULL or status = $2) ORDER BY created_at DESC LIMIT $3 OFFSET ($4 - 1) * $3`,
			[user.id, status, limit, page]
		)
		const total_pages = await getTotalWebsites()

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Websites fetched successfully!',
			data: websites.rows,
			meta: {
				current_page: page,
				per_page: limit,
				total_pages,
				has_next_page: page < total_pages,
				has_prev_page: page > 1,
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
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
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
	req: Request<
		GetWebsiteHistoryInput['params'],
		unknown,
		unknown,
		GetWebsiteHistoryInput['query']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { user } = res.locals.user
		const { id } = req.params
		const { status: requested_status, page: requested_page } = req.query

		const websiteExists = await findWebsite(id)
		if (!websiteExists.rows.length) {
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
		}

		const limit = 15
		const page = Number(requested_page) || 1
		const status = requested_status ?? null

		const website_histories = await db.query(
			'SELECT website_id, status, status_code, response_time, created_at, updated_at FROM website_history WHERE website_id = $1 AND user_id = $2 AND (cast($3 AS TEXT) IS NULL or status = $3) ORDER BY created_at DESC LIMIT $4 OFFSET ($5 - 1) * $4',
			[id, user.id, status, limit, page]
		)
		const total_pages = await getTotalWebsiteHistory(id, user.id)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website history fetched successfully',
			data: website_histories.rows,
			meta: {
				current_page: page,
				per_page: limit,
				total_pages,
				has_next_page: page < total_pages,
				has_prev_page: page > 1,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const getWebsiteReportHandler = async (
	req: Request<GetWebsiteInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const website = await findWebsite(id)
		if (!website.rows.length) {
			throw new ApiError('Website does not exist!', HttpStatusCode.NOT_FOUND)
		}

		const website_report = await db.query<WebsiteReport>(
			'SELECT downtime, availability, uptime, (SELECT AVG(response_time)::NUMERIC(10,2) AS average_response_time FROM website_history WHERE website_id = $1) FROM websites WHERE id = $1',
			[id]
		)
		const report = website_report.rows.at(0)
		const total_website = await getTotalWebsites()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Website report fetched successfully',
			data: {
				...report,
				total_website,
			},
		})
	} catch (error) {
		next(error)
	}
}
