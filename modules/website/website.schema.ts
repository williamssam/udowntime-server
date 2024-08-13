import { z } from 'zod'

const payload = {
	body: z.object({
		name: z.string({
			required_error: 'Title is required',
		}),
		url: z
			.string({
				required_error: 'Website URL is required',
			})
			.url('Invalid URL'),
	}),
}

const params = {
	params: z.object({
		website_id: z.string({
			required_error: 'Website id is required.',
		}),
	}),
}

export const createWebsiteSchema = z.object({
	...payload,
})
export const updateWebsiteSchema = z.object({
	...payload,
	...params,
})
export const deleteWebsiteSchema = z.object({
	...params,
})
export const getWebsiteSchema = z.object({
	...params,
})
export const getAllWebsitesSchema = z.object({
	params: z.object({
		page: z.string({
			required_error: 'Page is required',
		}),
	}),
})

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>['body']
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>
export type DeleteWebsiteInput = z.infer<typeof deleteWebsiteSchema>['params']
export type GetWebsiteInput = z.infer<typeof getWebsiteSchema>['params']
export type GetAllWebsitesInput = z.infer<typeof getAllWebsitesSchema>['params']
