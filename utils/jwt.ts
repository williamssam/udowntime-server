import jwt from 'jsonwebtoken'
import { config } from '../config'

export const signAccessJWT = (payload: Object) => {
	try {
		const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
		return jwt.sign(payload, key, {
			algorithm: 'RS256',
			expiresIn: config.access_token.expires_in,
		})
	} catch (error) {
		console.log('JWT sign error', error)
	}
}

// might include refresh token in the future
export const signRefreshJWT = (payload: Object) => {
	try {
		const key = Buffer.from(config.refresh_token.key, 'base64').toString('ascii')
		return jwt.sign(payload, key, {
			algorithm: 'RS256',
			expiresIn: config.refresh_token.expires_in,
		})
	} catch (error) {
		console.log('JWT sign error', error)
	}
}

export const verifyAccessJWT = async (token: string, options?: jwt.VerifyOptions) => {
	try {
		const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
		const decoded = jwt.verify(token, key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
	}
}

export const verifyRefreshJWT = async (token: string, options?: jwt.VerifyOptions) => {
	try {
		const key = Buffer.from(config.refresh_token.key, 'base64').toString('ascii')
		const decoded = jwt.verify(token, key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
	}
}
