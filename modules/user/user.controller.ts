import { hash } from '@node-rs/argon2'
import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { IS_PROD } from '../../utils/constant'
import { signAccessJWT } from '../../utils/jwt'
import { verifyHashedPassword } from './user.methods'
import type { CreateUserInput, LoginInput } from './user.schema'
import type { UserDocument } from './user.type'

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

		const { password: user_password, ...rest } = user.rows.at(0)
		res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'User created successfully',
			user: rest,
		})
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
		const { user } = res.locals.user
		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User fetched successfully',
			data: user,
		})
	} catch (error) {
		next(error)
	}
}

export const loginHandler = async (
	req: Request<unknown, unknown, LoginInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body

		const user = await db.query<UserDocument>(
			'SELECT email, password, username, id FROM users WHERE email = $1',
			[email]
		)
		if (!user.rows.length) {
			throw new ApiError(
				'Invalid email address or password',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const password_hash = user.rows.at(0)?.password as string
		const isValidPassword = await verifyHashedPassword(password, password_hash)

		if (!isValidPassword) {
			throw new ApiError(
				'Invalid email address or password',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		res.clearCookie('udowntime-access-token')
		// @ts-expect-error
		const { password: user_password, ...rest } = user.rows.at(0)

		// generate access token for the user
		const access_token = signAccessJWT({ user: rest })
		res.cookie('udowntime-access-token', access_token, {
			maxAge: 900_000, // 15mins
			httpOnly: IS_PROD,
			sameSite: 'strict',
			secure: IS_PROD,
		})

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User logged in successfully!',
			data: {
				user: rest,
				access_token,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const logoutHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		res.clearCookie('udowntime-access-token')

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User logged out successfully!',
		})
	} catch (error) {
		next(error)
	}
}
