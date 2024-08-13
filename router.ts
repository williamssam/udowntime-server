import express from 'express'
import { config } from './config'

const router = express.Router()

export default () => {
	router.get(`${config.api_url_prefix}/health-check`, (req, res) => {
		try {
			res.sendStatus(200)
		} catch (error) {
			console.error('error', error)
		}
	})

	// userRoutes(router)
	// sessionRoutes(router)
	// websiteRoutes(router)

	return router
}
