import { schema } from 'nexus'

schema.objectType({
  name: 'Error',
  definition(t) {
    t.string('field')
    t.string('message')
  }
})