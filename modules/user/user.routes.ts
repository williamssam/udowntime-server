import type express from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import {
	changePasswordHandler,
	createUserHandler,
	getCurrentUserHandler,
} from './user.controller'
import { changePasswordSchema, createUserSchema } from './user.schema'

export default (router: express.Router) => {
	router.post(
		`${config.api_url_prefix}/auth/signup`,
		[validateResource(createUserSchema)],
		createUserHandler
	)

	// change password for authenticated user
	router.patch(
		`${config.api_url_prefix}/auth/change-password`,
		[validateResource(changePasswordSchema)],
		changePasswordHandler
	)

	// authenticated user
	router.get(`${config.api_url_prefix}/auth/user`, getCurrentUserHandler)
}
