import type express from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createWebsiteHandler,
	deleteWebsiteHandler,
	getAuthenticatedUserWebsitesHandler,
	getWebsiteHandler,
	getWebsiteHistoryHandler,
	updateWebsiteHandler,
	updateWebsiteStatusHandler,
} from './website.controller'
import {
	createWebsiteSchema,
	deleteWebsiteSchema,
	getAllWebsitesSchema,
	getWebsiteSchema,
	updateWebsiteSchema,
	updateWebsiteStatusSchema,
} from './website.schema'

export default (router: express.Router) => {
		/**
	 * @description get all current authenticated user websites
	 */
	router.get(
		`${config.api_url_prefix}/website`,
		[deserializeUser, requireUser, validateResource(getAllWebsitesSchema)],
		getAuthenticatedUserWebsitesHandler
	)

	/**
	 * @description add new website
	 */
	router.post(
		`${config.api_url_prefix}/website`,
		[deserializeUser, requireUser, validateResource(createWebsiteSchema)],
		createWebsiteHandler
	)

	/**
	 * @description get one website
	 */
	router.get(
		`${config.api_url_prefix}/website/:id`,
		[deserializeUser, requireUser, validateResource(getWebsiteSchema)],
		getWebsiteHandler
	)

	/**
	 * @description Update website
	 */
	router.put(
		`${config.api_url_prefix}/website/:id`,
		[deserializeUser, requireUser, validateResource(updateWebsiteSchema)],
		updateWebsiteHandler
	)

	/**
	 * @description Update website status
	 */
	router.patch(
		`${config.api_url_prefix}/website/status/:id`,
		[deserializeUser, requireUser, validateResource(updateWebsiteStatusSchema)],
		updateWebsiteStatusHandler
	)

	/**
	 * @description delete website
	 */
	router.delete(
		`${config.api_url_prefix}/website/:id`,
		[deserializeUser, requireUser, validateResource(deleteWebsiteSchema)],
		deleteWebsiteHandler
	)

	/**
	 * @description get website history
	 */
	router.get(
		`${config.api_url_prefix}/website/history/:id`,
		[deserializeUser, requireUser, validateResource(getWebsiteSchema)],
		getWebsiteHistoryHandler
	)
}
