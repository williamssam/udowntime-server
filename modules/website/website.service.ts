import { db } from '../../db'

export const findWebsite = async (id: string) => {
	return await db.query('SELECT id FROM websites WHERE id = $1', [id])
}