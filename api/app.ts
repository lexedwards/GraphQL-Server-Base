import { use } from 'nexus'
import { prisma } from 'nexus-plugin-prisma'
import { auth } from 'nexus-plugin-jwt-auth'
import { shield } from 'nexus-plugin-shield'
import { rules } from './permissions'

use(prisma({
  features: { crud: true }
}))

use(auth({
  appSecret: process.env.APP_SECRET as string
}))

use(shield({
  rules
}))