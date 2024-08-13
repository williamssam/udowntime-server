import { hash, verify } from '@node-rs/argon2'

export const hashPassword = async (password: string) => {
	return await hash(password, {
		// recommended minimum parameters: https://github.com/lucia-auth/examples/blob/main/express/username-and-password/routes/signup.ts
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	})
}

export const verifyHashedPassword = async (
	password: string,
	password_hash: string
) => {
	return await verify(password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	})
}
