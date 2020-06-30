import { schema } from 'nexus'
import { hashPassword, verifyPassword } from '../utils/hash'
import { sign, getUserId } from '../utils/token'

/**
 *  Users 
 *  Create, Login, Update, Delete
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
      async resolve(_root, { name, email, phone, password }, ctx) {
        try {
          const hashed = await hashPassword(password)
          const userExists = Boolean(await ctx.db.user.findOne({ where: { email } }))
          if (userExists) throw { field: email, message: "Email already in use" }
          const user = await ctx.db.user.create({
            data: {
              name,
              email,
              phone,
              password: hashed
            }
          })
          return {
            token: sign(user.id),
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
      async resolve(_root, { email, password }, ctx) {
        try {
          const isUser = await ctx.db.user.findOne({ where: { email } })
          if (!isUser) throw { field: 'user', message: 'No User Found' }
          const validPassword = await verifyPassword(isUser.password, password)
          if (!validPassword) throw { field: 'password', message: 'Invalid Email / Password' }
          return {
            token: sign(isUser.id),
            user: isUser
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