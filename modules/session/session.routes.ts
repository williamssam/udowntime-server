import type express from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import { createSessionHandler, refreshTokenHandler } from './session.controller'
import { createSessionSchema } from './session.schema'

export default (router: express.Router) => {
	// login
	router.post(
		`${config.api_url_prefix}/auth/login`,
		[validateResource(createSessionSchema)],
		createSessionHandler
	)

	// refresh token
	router.post(`${config.api_url_prefix}/auth/refresh`, refreshTokenHandler)

	// logout
	// router.post(`${config.api_url_prefix}/auth/logout`, logoutHandler)
}
