import { hash } from '@node-rs/argon2'
import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { hashPassword, verifyHashedPassword } from './user.methods'
import type { CreateUserInput, UpdateUserInput } from './user.schema'

export const createUserHandler = async (
	req: Request<unknown, unknown, CreateUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, username, password } = req.body

		const emailExists = await db.query(
			'SELECT email FROM users WHERE email = $1',
			[email]
		)
		if (emailExists.rows.length) {
			throw new ApiError(
				'User with email address already exists.',
				HttpStatusCode.CONFLICT
			)
		}

		const usernameExists = await db.query(
			'SELECT username FROM users WHERE username = $1',
			[username]
		)
		if (usernameExists.rows.length) {
			throw new ApiError(
				'User with username already exists.',
				HttpStatusCode.CONFLICT
			)
		}

		const hashedPassword = await hash(password, {
			// recommended minimum parameters: https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/signup.ts
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})

		const user = await db.query(
			'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *',
			[email, username, hashedPassword]
		)
		res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'User created successfully',
			user: user.rows[0],
		})
	} catch (error) {
		next(error)
	}
}

export const changePasswordHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = res.locals.user
		const { old_password, new_password } = req.body

		const password_hash = user.password
		const isValidPassword = await verifyHashedPassword(
			old_password,
			password_hash
		)
		if (!isValidPassword) {
			throw new ApiError(
				'Old password is not correct',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const hashedPassword = await hashPassword(new_password)
		await db.query('UPDATE users SET password = $1 WHERE id = $2', [
			hashedPassword,
			user.id,
		])

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Password changed successfully',
		})
	} catch (error) {
		next(error)
	}
}

// update user info
// TODO: update user not complete
const updateUserHandler = async (
	req: Request<unknown, unknown, UpdateUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, username } = req.body
	} catch (error) {
		next(error)
	}
}

export const getCurrentUserHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = res.locals.user
		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User fetched successfully',
			user,
		})
	} catch (error) {
		next(error)
	}
}
