import type express from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import { createWebsiteHandler } from './website.controller'
import { createWebsiteSchema } from './website.schema'

export default (router: express.Router) => {
	router.post(
		`${config.api_url_prefix}/website`,
		[validateResource(createWebsiteSchema)],
		createWebsiteHandler
	)
}
