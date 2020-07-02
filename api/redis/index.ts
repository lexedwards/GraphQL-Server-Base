import { createClient } from 'redis'

const client = createClient();

client.on('error', error => { return { field: 'redis', message: error } })

export { client as default }