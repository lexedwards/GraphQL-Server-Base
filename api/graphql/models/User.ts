import { schema } from 'nexus'

schema.objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.email()
    t.model.phone()
  }
})

schema.objectType({
  name: 'UserPayload',
  definition(t) {
    t.field('user', { type: 'User' })
    t.field('error', { type: 'Error' })
  }
})