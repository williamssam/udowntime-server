export const createUserTable = `CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	email VARCHAR UNIQUE NOT NULL,
	username VARCHAR UNIQUE NOT NULL,
	password VARCHAR NOT NULL,
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

export const createWebsiteTrigger = `
CREATE OR REPLACE FUNCTION update_website_history()
RETURNS TRIGGER
AS $$
BEGIN
    IF NEW.status = 'available' THEN
        UPDATE websites
        SET uptime = uptime + 1,
						availability = COALESCE((uptime / NULLIF((uptime + downtime), 0)) * 100,0)
        WHERE id = NEW.website_id;
    ELSIF NEW.status = 'unavailable' THEN
        UPDATE websites
        SET downtime = downtime + 1,
						availability = COALESCE((uptime / NULLIF(uptime + downtime, 0)) * 100,0)
        WHERE id = NEW.website_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`

export const triggerUpdateWebsite =
	'CREATE OR REPLACE TRIGGER update_website_history_trigger AFTER INSERT OR UPDATE ON website_history FOR EACH ROW EXECUTE FUNCTION update_website_history();'
