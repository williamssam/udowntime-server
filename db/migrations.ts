export const createUserTable = `CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email VARCHAR UNIQUE NOT NULL,
	username VARCHAR UNIQUE NOT NULL,
	password VARCHAR NOT NULL,
	refresh_token TEXT UNIQUE NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`

export const createWebsiteTable = `CREATE TABLE IF NOT EXISTS websites (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR NOT NULL,
	url VARCHAR UNIQUE NOT NULL,
	status VARCHAR NOT NULL CHECK (status IN ('monitored', 'not-monitored')),
	downtime INTEGER NOT NULL DEFAULT 0,
	availability INTEGER NOT NULL DEFAULT 0,
	uptime INTEGER NOT NULL DEFAULT 0,
	average_response_time INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`

	// jwt_version INTEGER NOT NULL DEFAULT 0 CHECK (jwt_version >= 0), -- default value is 0, increment by 1 every time access token is refreshed, if version !== version passed, then access token has expired

export const createWebsiteHistoryTable = `CREATE TABLE IF NOT EXISTS website_history (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
	status VARCHAR NOT NULL CHECK (status IN ('available', 'unavailable')),
	status_code INTEGER NULL,
	response_time INTEGER NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`
