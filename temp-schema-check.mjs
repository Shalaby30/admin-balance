import fs from 'fs/promises'
import { neon } from '@neondatabase/serverless'

const envText = await fs.readFile('.env', 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter(Boolean).map(line => {
  const [k, ...rest] = line.split('=')
  return [k, rest.join('=')]
}))
const sql = neon(env.VITE_DATABASE_URL, { disableWarningInBrowsers: true })
const columns = await sql`SELECT column_name, column_default, is_nullable, data_type FROM information_schema.columns WHERE table_name='invoices' ORDER BY ordinal_position`
console.log('COLUMNS:', JSON.stringify(columns, null, 2))
const seq = await sql`SELECT pg_get_serial_sequence('invoices', 'id') AS seq`
console.log('SEQUENCE:', JSON.stringify(seq, null, 2))
