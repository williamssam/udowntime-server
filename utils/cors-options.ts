// import { ApiError } from '../exceptions/api-error'

import { ApiError } from '../exceptions/api-error'
import { HttpStatusCode } from '../types'

const whitelist = ['http://localhost:5173']

/**
 * Defines the CORS options for handling requests based on the origin.
 */
export const corsOptions = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
	if (whitelist.includes(origin as string) || !origin) {
		callback(null, true)
	} else {
		callback(new ApiError(`CORS error. Origin: ${origin} not allowed`, HttpStatusCode.BAD_REQUEST))
	}
}
