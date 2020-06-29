import { schema } from 'nexus'

schema.extendType({
  type: 'Query',
  definition(t) {
    t.crud.users({
      filtering: {
        id: true,
        email: true
      },
      ordering: {
        id: true
      }
    })
  }
})