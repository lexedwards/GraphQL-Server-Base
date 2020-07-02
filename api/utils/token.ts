import * as jwt from 'jsonwebtoken'

function getUserId(token: any | null | undefined) {
  const userId = token.userId
  if (!userId) {
    throw new Error('No User Found')
  }
  return userId
}

async function getUserIdByRefresh(token: string): Promise<string> {
  if (typeof process.env.REFRESH_SECRET !== 'string') throw new Error('No Refresh Secret set')
  const userId = jwt.verify(token, process.env.REFRESH_SECRET) as { userId: string }
  if (!userId) {
    throw new Error('No User Found')
  }
  return userId.userId
}

async function sign(id: string) {
  if (typeof process.env.AUTH_SECRET !== 'string') throw new Error('No Auth Secret set')
  if (typeof process.env.REFRESH_SECRET !== 'string') throw new Error('No Refresh Secret set')

  return {
    auth: jwt.sign({ userId: id }, process.env.AUTH_SECRET, { expiresIn: process.env.AUTH_EXP || '15m' }),
    refresh: jwt.sign({ userId: id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXP || '1d' })
  }
}

export { getUserId, sign, getUserIdByRefresh }