
export const fetchWebsite = async (url: string) => {
	const now = Date.now()
	const resp = await fetch(url, {
		method: 'GET',
	})
	const response_time = Date.now() - now

	return {
		ok: resp.ok,
		status: resp.ok ? 'available' : 'unavailable',
		response_time: response_time,
		status_code: resp.status,
	} as const
}

// if status text === OK, increase uptime by 1 else increase downtime by 1
// for each request to the website, create an object in the history array
// if status text === OK, return status === 'available' else return status === 'unavailable'
