import type express from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createWebsiteHandler,
	deleteWebsiteHandler,
	getWebsiteHandler,
	updateWebsiteHandler,
} from './website.controller'
import {
	createWebsiteSchema,
	deleteWebsiteSchema,
	getWebsiteSchema,
	updateWebsiteSchema,
} from './website.schema'

export default (router: express.Router) => {
	router.post(
		`${config.api_url_prefix}/website`,
		[validateResource(createWebsiteSchema)],
		createWebsiteHandler
	)

	router.get(
		`${config.api_url_prefix}/website/:id`,
		[validateResource(getWebsiteSchema)],
		getWebsiteHandler
	)

	router.put(
		`${config.api_url_prefix}/website/:id`,
		[validateResource(updateWebsiteSchema)],
		updateWebsiteHandler
	)

	router.put(
		`${config.api_url_prefix}/website/:id`,
		[validateResource(deleteWebsiteSchema)],
		deleteWebsiteHandler
	)
}
