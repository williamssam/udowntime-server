import jwt from 'jsonwebtoken'
import { config } from '../config'

export const signAccessJWT = (payload: Object) => {
	try {
		return jwt.sign(payload, config.access_token.key, {
			expiresIn: config.access_token.expires_in,
		})
	} catch (error) {
		console.log('JWT sign error', error)
	}
}

// might include refresh token in the future
export const signRefreshJWT = (payload: Object) => {
	try {
		return jwt.sign(payload, config.refresh_token.key, {
			expiresIn: config.refresh_token.expires_in,
		})
	} catch (error) {
		console.log('JWT sign error', error)
	}
}

export const verifyAccessJWT = async (token: string, options?: jwt.VerifyOptions) => {
	try {
		const decoded = jwt.verify(token, config.access_token.key, options)

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
		const decoded = jwt.verify(token, config.refresh_token.key, options)

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
