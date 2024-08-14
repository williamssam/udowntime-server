export const config = {
	port: process.env.PORT || '4321',
	api_url: process.env.API_URL as string,
	api_url_prefix: '/api/v1',

	db_user: process.env.DB_USER as string,
	db_pass: process.env.DB_PASSWORD as string,
	db_database: process.env.DB_DATABASE as string,
	db_host: process.env.DB_HOST as string,
	db_port: Number(process.env.DB_PORT as string),

	smtp_host: process.env.SMTP_HOST as string,
	smtp_user: process.env.SMTP_USERNAME as string,
	smtp_pass: process.env.SMTP_PASSWORD as string,

	access_token: {
		key: process.env.ACCESS_TOKEN_KEY as string,
		expires_in: '15m',
	},
	refresh_token: {
		key: process.env.REFRESH_TOKEN_KEY as string,
		expires_in: '7d',
	},
} as const
