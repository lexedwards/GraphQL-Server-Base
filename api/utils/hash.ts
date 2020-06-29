import * as argon from 'argon2'

const pwdCheck = (password: string) => (
  password.length > 8 &&
  // non-alphanumeric
  /\W/.test(password) &&
  // digit
  /\d/.test(password) &&
  // capital letter
  /[A-Z]/.test(password) &&
  // lowercase letter
  /[a-z]/.test(password)
)

async function hashPassword(pwd: string) {
  if (!pwdCheck(pwd)) throw new Error('Invalid Password')
  return argon.hash(pwd)
}

async function verifyPassword(hash: string, pwd: string) {
  return argon.verify(hash, pwd)
}


export { hashPassword, verifyPassword }