import fs from 'fs/promises'
import { neon } from '@neondatabase/serverless'

const envText = await fs.readFile('.env', 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter(Boolean).map(line => {
  const [k, ...rest] = line.split('=')
  return [k, rest.join('=')]
}))
const sql = neon(env.VITE_DATABASE_URL, { disableWarningInBrowsers: true })
const cols = await sql`SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name='projects' ORDER BY ordinal_position`
console.log(JSON.stringify(cols, null, 2))
