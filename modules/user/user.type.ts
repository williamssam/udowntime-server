export type UserDocument = {
		id: number
		email: string
		username: string
		password: string
		created_at: Date
		updated_at: Date
	}

export type User = Omit<UserDocument, 'password'>
