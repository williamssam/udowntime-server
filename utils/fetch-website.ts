import { ApiError } from '../exceptions/api-error'
import { HttpStatusCode } from '../types'

export const fetchWebsite = async (url: string) => {
	try {
		const now = Date.now()
		const resp = await fetch(url, {
			method: 'GET',
		})
		const response_time = Date.now() - now

		return {
			ok: resp.ok,
			status: resp.ok ? 'available' : 'unavailable',
			response_time: response_time,
			status_code: resp.status,
		}
	} catch (error) {
		throw new ApiError(
			'Failed to fetch website',
			HttpStatusCode.INTERNAL_SERVER_ERROR
		)
	}
}

// if status text === OK, increase uptime by 1 else increase downtime by 1
// for each request to the website, create an object in the history array
// if status text === OK, return status === 'available' else return status === 'unavailable'
