import { z } from 'zod'

export const createUserSchema = z.object({
	body: z.object({
		username: z
			.string({ required_error: 'Name is required' })
			.max(32, 'Username cannot be more than 32 characters')
			.trim(),
		email: z
			.string({ required_error: 'Email is required' })
			.email('Not a valid email')
			.trim(),
		password: z
			.string({ required_error: 'Password is required' })
			.min(6, 'Password too short - should be 6 characters minimum')
			.max(30, 'Password too long - should be 30 characters maximum')
			.trim(),
	}),
})

const verifyUserSchema = z.object({
	body: z.object({
		id: z.number({
			required_error: 'User id is required',
		}),
		verification_Code: z.number({
			required_error: 'Verification code is required',
		}),
	}),
})

export const changePasswordSchema = z.object({
	body: z.object({
		old_password: z
			.string({ required_error: 'Password is required' })
			.min(6, 'Password too short - should be 6 characters minimum')
			.max(30, 'Password too long - should be 30 characters maximum')
			.trim(),
		new_password: z
			.string({ required_error: 'Password is required' })
			.min(6, 'Password too short - should be 6 characters minimum')
			.max(30, 'Password too long - should be 30 characters maximum')
			.trim(),
	}),
})

const forgotPasswordSchema = z.object({
	body: z.object({
		email: z
			.string({ required_error: 'Email is required' })
			.email('Not a valid email')
			.trim(),
	}),
})

export type CreateUserInput = z.TypeOf<typeof createUserSchema>['body']
export type VerifyUserInput = z.TypeOf<typeof verifyUserSchema>['body']
export type ChangePasswordInput = z.TypeOf<typeof changePasswordSchema>['body']
export type ForgotPasswordInput = z.TypeOf<typeof forgotPasswordSchema>['body']
export type UpdateUserInput = Omit<
	z.TypeOf<typeof createUserSchema>['body'],
	'password'
>
