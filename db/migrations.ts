export const createUserTable = `CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(50) NOT NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`

export const createSessionTable = `CREATE TABLE IF NOT EXISTS sessions (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	refresh_token VARCHAR(255) UNIQUE NOT NULL,
	is_valid BOOLEAN NOT NULL DEFAULT TRUE, -- is the refresh token still valid
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`

export const createWebsiteTable = `CREATE TABLE IF NOT EXISTS websites (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	url VARCHAR(255) UNIQUE NOT NULL,
	status VARCHAR(30) NOT NULL CHECK (status IN ('available', 'unavailable')),
	downtime INTEGER NOT NULL DEFAULT 0,
	availability INTEGER NOT NULL DEFAULT 0,
	uptime INTEGER NOT NULL DEFAULT 0,
	average_response_time INTEGER NOT NULL DEFAULT 0,
	last_check TIMESTAMPTZ NULL, -- last time the website was checked, might delete
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`

export const createWebsiteHistoryTable = `CREATE TABLE IF NOT EXISTS website_history (
	id SERIAL PRIMARY KEY,
	website_id INTEGER REFERENCES website(id),
	status VARCHAR(30) NOT NULL CHECK (status IN ('available', 'unavailable')),
	status_code INTEGER NULL,
	response_time INTEGER NULL,
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)`
