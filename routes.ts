import { Router } from 'express'
import { config } from './config'
import sessionRoutes from './modules/session/session.routes'
import userRoutes from './modules/user/user.routes'
import websiteRoutes from './modules/website/website.routes'

const router = Router()

export default () => {
	router.get(`${config.api_url_prefix}/health-check`, (_, res) =>
		res.sendStatus(200)
	)

	userRoutes(router)
	sessionRoutes(router)
	websiteRoutes(router)
}
