import { use, schema } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { auth } from 'nexus-plugin-jwt-auth'
import { shield } from 'nexus-plugin-shield'
import { rules } from './permissions'
import redis from './redis'
import { RedisClient } from 'redis'

use(prisma({
  features: { crud: true }
}))

use(auth({
  appSecret: process.env.APP_SECRET as string
}))

use(shield({
  rules
}))

schema.addToContext(_req => {
  return { redis }
})

declare global {
  interface NexusContext {
    redis: RedisClient
  }
}