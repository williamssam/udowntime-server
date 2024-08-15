export type Website = {
		id: number
		name: string
		url: string
		status: string
		uptime: number
		downtime: number
		availability: number
		average_response_time: number
		user_id: number
		is_monitored: boolean
		updated_at: Date
	}

export type WebsiteHistory = {
	id: number
	website_id: number
	user_id: number
	status: string
	status_code: number
	response_time: number
}