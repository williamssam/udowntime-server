import type { NextFunction, Request, Response } from 'express'
import { db } from '../../db'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { IS_PROD } from '../../utils/constant'
import {
	signAccessJWT,
	signRefreshJWT,
	verifyAccessJWT,
	verifyRefreshJWT,
} from '../../utils/jwt'
import type { CreateSessionInput } from '../session/session.schema'
import { verifyHashedPassword } from '../user/user.methods'
import type { UserDocument } from '../user/user.type'

export const createSessionHandler = async (
	req: Request<unknown, unknown, CreateSessionInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body

		const user = await db.query<UserDocument>(
			'SELECT email FROM users WHERE email = $1',
			[email]
		)
		if (!user.rows.length) {
			throw new ApiError(
				'Invalid email or password',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const password_hash = user.rows[0].password
		const isValidPassword = await verifyHashedPassword(password, password_hash)

		if (!isValidPassword) {
			throw new ApiError(
				'Invalid email or password',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// generate access token for the user
		const access_token = signAccessJWT({ user: user.rows.at(0) })
		const refresh_token = signRefreshJWT({ user_id: user.rows.at(0)?.id })
		res.cookie('udowntime-access-token', access_token, {
			maxAge: 900_000, // 15mins
			httpOnly: IS_PROD,
			sameSite: 'strict',
			secure: IS_PROD,
		})
		res.cookie('udowntime-refresh-token', refresh_token, {
			maxAge: 6.048e8, // 7days
			httpOnly: IS_PROD,
			sameSite: 'strict',
			secure: IS_PROD,
		})

		const session = await db.query(
			'INSERT INTO sessions (user_id, refresh_token, is_valid) VALUES ($1, $2, $3) RETURNING *',
			[user.rows.at(0)?.id, refresh_token, true]
		)

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User logged in successfully!',
			data: {
				user: user.rows.at(0),
				access_token,
				refresh_token: session.rows.at(0).refresh_token,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const refreshTokenHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const refresh_token = req.cookies['udowntime-refresh-token']
		const access_token = req.cookies['udowntime-access-token']

		// check if access token is valid
		const { is_valid } = await verifyAccessJWT(access_token, {
			ignoreExpiration: true,
		})
		if (!is_valid) {
			throw new ApiError('Invalid access token!', HttpStatusCode.UNAUTHORIZED)
		}

		const {
			is_valid: is_valid_refresh_token,
			// @ts-expect-error
			decoded: { user_id },
		} = await verifyRefreshJWT(refresh_token)

		if (!is_valid_refresh_token) {
			// FIXME: I should not use user_id here, cos a user might have multiple sessions
			await db.query<UserDocument>(
				'UPDATE sessions SET is_valid = $1 WHERE user_id = $2',
				[false, user_id]
			)

			throw new ApiError(
				'Invalid or expired refresh token!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		// this might not be necessary, since we already have a require user middleware which throws an error if user is not found
		const user = await db.query<UserDocument>(
			'SELECT id FROM users WHERE id = $1',
			[user_id]
		)
		if (!user.rows.length) {
			throw new ApiError(
				'Invalid or expired refresh token!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const new_access_token = signAccessJWT({ user: user.rows.at(0) })
		res.cookie('udowntime-access-token', new_access_token, {
			maxAge: 900_000, // 15mins
			httpOnly: IS_PROD,
			sameSite: 'strict',
			secure: IS_PROD,
		})

		res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Refreshed access token successfully!',
			data: {
				refresh_token,
				access_token: new_access_token,
				// refresh_expires_in: config.refresh_token.expires_in,
			},
		})
	} catch (error) {
		next(error)
	}
}

// TODO: not complete
export const deleteSessionHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const refresh_token = req.cookies['udowntime-refresh-token']
		const access_token = req.cookies['udowntime-access-token']

		// check if access token is valid
		const { is_valid } = await verifyAccessJWT(access_token, {
			ignoreExpiration: true,
		})
		if (!is_valid) {
			throw new ApiError('Invalid access token!', HttpStatusCode.UNAUTHORIZED)
		}
	} catch (error) {
		next(error)
	}
}
