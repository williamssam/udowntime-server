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

