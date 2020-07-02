import { schema } from 'nexus'
import { hashPassword, verifyPassword } from '../utils/hash'
import { sign, getUserId, getUserIdByRefresh } from '../utils/token'

/**
 *  Users 
 *  Create, Login, Update, Delete
 * 
 * Extra - ReAuthenticate
 */

schema.extendType({
  type: 'Mutation',
  definition(t) {
    t.field('signupUser', {
      type: 'AuthPayload',
      args: {
        name: schema.stringArg({ nullable: false }),
        email: schema.stringArg({ nullable: false }),
        phone: schema.stringArg(),
        password: schema.stringArg({ nullable: false }),
      },
      async resolve(_root, { name, email, phone, password }, { db, redis }) {
        try {
          const hashed = await hashPassword(password)
          const userExists = Boolean(await db.user.findOne({ where: { email } }))
          if (userExists) throw { field: email, message: "Email already in use" }
          const user = await db.user.create({
            data: {
              name,
              email,
              phone,
              password: hashed
            }
          })
          const tokens = await sign(user.id)
          redis.set(user.id, tokens.refresh)
          return {
            tokens,
            user
          }
        } catch (error) {
          return { error }
        }
      }
    })
    t.field('loginUser', {
      type: 'UserPayload',
      args: {
        email: schema.stringArg({ nullable: false }),
        password: schema.stringArg({ nullable: false })
      },
      async resolve(_root, { email, password }, { db, redis }) {
        try {
          const isUser = await db.user.findOne({ where: { email } })
          if (!isUser) throw { field: 'user', message: 'No User Found' }
          const validPassword = await verifyPassword(isUser.password, password)
          if (!validPassword) throw { field: 'password', message: 'Invalid Email / Password' }
          const tokens = await sign(isUser.id)
          redis.set(isUser.id, tokens.refresh)
          return {
            tokens,
            user: isUser
          }
        } catch (error) {
          return { error }
        }
      }
    })
    t.field('reauthenticate', {
      type: 'UserPayload',
      args: {
        refreshToken: schema.stringArg({ nullable: false })
      },
      async resolve(_root, { refreshToken }, { redis, db }) {
        try {
          const id = await getUserIdByRefresh(refreshToken)
          if (!id) throw { field: 'token', message: 'Invalid Token' }
          redis.get(id, (err, res) => {
            if (err || res !== refreshToken) throw { field: 'token', message: 'Invalid Token' }
          })
          const user = await db.user.findOne({ where: { id } })
          if (!user) throw { field: 'user', message: 'No User Found' }
          const tokens = await sign(id)
          redis.set(id, tokens.refresh)
          return {
            tokens,
            user
          }
        } catch (error) {
          return { error }
        }
      }
    })
    t.field('updateUser', {
      type: 'UserPayload',
      args: {
        name: schema.stringArg(),
        email: schema.stringArg(),
        phone: schema.stringArg(),
        currentPassword: schema.stringArg({ nullable: false }),
        password: schema.stringArg()
      },
      async resolve(_root, args, ctx) {
        try {
          const id = getUserId(ctx.token)
          const isUser = await ctx.db.user.findOne({ where: { id } })
          if (!isUser) throw { field: 'user', message: 'No User Found' }
          if (args.email && args.email !== isUser?.email) {
            const checkEmail = await ctx.db.user.findOne({ where: { email: args.email } })
            if (checkEmail) throw { field: args.email, message: 'Email has been taken already' }
          }
          const { currentPassword, ...updateArgs } = args

          const validPassword = await verifyPassword(isUser.password, currentPassword)
          if (!validPassword) throw { field: 'password', message: 'Invalid Password' }

          if (updateArgs.password) updateArgs.password = await hashPassword(updateArgs.password)

          const data = {
            name: updateArgs.name!,
            email: updateArgs.email!,
            phone: updateArgs.phone,
            password: updateArgs.password!
          }
          const User = await ctx.db.user.update({ where: { id }, data })
          return { user: User }
        } catch (error) {
          return { error }
        }
      }
    }),
      t.field('deleteOneUser', {
        type: 'UserPayload',
        args: {
          email: schema.stringArg({ required: true }),
          password: schema.stringArg({ required: true })
        },
        async resolve(_root, { email, password }, ctx) {
          try {
            const isUser = await ctx.db.user.findOne({ where: { id: getUserId(ctx.token) } })
            if (!isUser) throw { field: 'user', message: 'User not found' }
            const validPassword = await verifyPassword(isUser.password, password)
            if (!validPassword) throw { field: 'password', message: 'Invalid Password' }
            const User = await ctx.db.user.delete({ where: { email } })
            return { user: User }
          } catch (error) {
            return { error }
          }
        }
      })
  }
})