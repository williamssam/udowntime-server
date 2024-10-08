import type express from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createUserHandler,
	getCurrentUserHandler,
	loginHandler,
	logoutHandler,
} from './user.controller'
import { createUserSchema, loginSchema } from './user.schema'

export default (router: express.Router) => {
	router.post(
		`${config.api_url_prefix}/auth/signup`,
		[validateResource(createUserSchema)],
		createUserHandler
	)

	// authenticated user
	router.get(
		`${config.api_url_prefix}/me`,
		[deserializeUser, requireUser],
		getCurrentUserHandler
	)

	router.post(
		`${config.api_url_prefix}/auth/login`,
		[validateResource(loginSchema)],
		loginHandler
	)

	// logout user
	router.post(`${config.api_url_prefix}/auth/logout`, logoutHandler)
}
