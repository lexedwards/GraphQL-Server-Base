import * as jwt from 'jsonwebtoken'

function getUserId(token: any | null | undefined) {
  const userId = token.userId
  if (!userId) {
    throw new Error('No User Found')
  }
  return userId
}

async function sign(id: string) {
  return jwt.sign({ userId: id }, process.env.APP_SECRET as string)
}

export { getUserId, sign }