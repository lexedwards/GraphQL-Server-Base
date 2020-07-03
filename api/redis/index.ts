import * as Redis from 'ioredis'

const client = new Redis()

client.on('error', error => { return { field: 'redis', message: error } })

export { client as default }