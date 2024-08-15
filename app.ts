import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import cron from 'node-cron'
import { config } from './config'
import { runDBMigrations } from './db'
import { checkWebsites } from './jobs/check-website'
import errorHandler from './middlewares/error-handler'
import routes from './routes'
import { corsOptions } from './utils/cors-options'

const app = express()

// <-- MIDDLEWARES -->
app.use(
	cors({
		origin: corsOptions,
	})
)
// app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// TODO: handle route not found errors
app.use(routes())
app.use(errorHandler)

// <-- SERVER STARTs -->
app.listen(config.port, async () => {
	try {
		await runDBMigrations()
		console.log(`Server started on port http://localhost:${config.port}`)
	} catch (error) {
		console.error('Error connecting to database', error)
	}
})

// Run this job every day at midnight
cron.schedule('* * * * *', () => {
	console.log('Checking websites every minute...')
	checkWebsites()
})
