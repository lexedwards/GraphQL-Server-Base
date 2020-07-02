import { schema } from 'nexus'

schema.objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('error', { type: 'Error' })
    t.field('tokens', { type: 'Tokens' })
    t.field('user', { type: 'User' })
  }
})

schema.objectType({
  name: 'Tokens',
  definition(t) {
    t.field('auth', { type: 'String' })
    t.field('refresh', { type: 'String' })
  }
})