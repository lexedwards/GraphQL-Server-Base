import { schema } from 'nexus'

schema.objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('error', { type: 'Error' })
    t.string('token')
    t.field('user', { type: 'User' })
  }
})