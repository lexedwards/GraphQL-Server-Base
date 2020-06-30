import * as redis from 'redis'

const client = redis.createClient();

client.on('error', error => { return { field: 'redis', message: error } })

export { client as default }