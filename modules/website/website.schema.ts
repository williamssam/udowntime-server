import { z } from 'zod'

const payload = {
	body: z.object({
		name: z.string({
			required_error: 'Website name is required',
		}),
		url: z
			.string({
				required_error: 'Website URL is required',
			})
			.url('Invalid URL'),
		is_monitored: z.boolean({
			required_error: 'Should be monitored or not?',
		}),
	}),
}

const params = {
	params: z.object({
		id: z.string({
			required_error: 'Website id is required.',
		}),
	}),
}

export const createWebsiteSchema = z.object({
	...payload,
})
export const updateWebsiteSchema = z.object({
	body: z.object({
		name: z.string({ required_error: 'Website name is required' }).trim(),
	}),
	...params,
})
export const deleteWebsiteSchema = z.object({ ...params })
export const getWebsiteSchema = z.object({ ...params })
export const getAllWebsitesSchema = z.object({
	query: z.object({
		page: z
			.string({
				required_error: 'Page is required',
			})
			.catch('1'),
		status: z.enum(['all', 'available', 'unavailable']).catch('all'),
	}),
})
export const updateWebsiteStatusSchema = z.object({
	...params,
	body: z.object({
		is_monitored: z.boolean({ required_error: 'Should be monitored or not?' }),
	}),
})

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>['body']
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>
export type DeleteWebsiteInput = z.infer<typeof deleteWebsiteSchema>['params']
export type GetWebsiteInput = z.infer<typeof getWebsiteSchema>['params']
export type GetAllWebsitesInput = z.infer<typeof getAllWebsitesSchema>['query']
export type UpdateWebsiteStatusInput = z.infer<typeof updateWebsiteStatusSchema>
