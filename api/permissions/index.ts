import { rule } from 'nexus-plugin-shield'
import { getUserId } from '../utils/token'

const isAuthenticated = rule({ cache: 'contextual' })(
  async (_root, _args, ctx: NexusContext) => {
    const userId = getUserId(ctx.token)
    return Boolean(userId)
  }
)

const rules = {
  Query: {

  },
  Mutations: {
    updateOneUser: isAuthenticated,
    deleteOneUser: isAuthenticated
  }
}

export { rules }