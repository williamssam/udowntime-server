import pg from 'pg'
import { config } from '../config'
import {
	createUserTable,
	createWebsiteHistoryTable,
	createWebsiteTable,
	createWebsiteTrigger,
	triggerUpdateWebsite,
} from './migrations'

const { Pool } = pg

const db = new Pool({
	user: config.db_user,
	password: config.db_pass,
	database: config.db_database,
	host: config.db_host,
	port: config.db_port,
})

const runDBMigrations = async () => {
	const client = await db.connect()

	try {
		await client.query('BEGIN') // begin transaction

		await client.query(createUserTable)
		await client.query(createWebsiteTable)
		await client.query(createWebsiteHistoryTable)

		await client.query(createWebsiteTrigger)
		await client.query(triggerUpdateWebsite)

		await client.query('COMMIT') // commit transactions
		console.log('END DB MIGRATION')

	} catch (error) {
		await client.query('ROLLBACK') // rollback transactions
		console.error('DB migrations failed', error)
		throw error
	} finally {
		client.release()
	}
}

export { db, runDBMigrations }

