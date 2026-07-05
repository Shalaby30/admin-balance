import { neon } from '@neondatabase/serverless'

const databaseUrl = import.meta.env.VITE_DATABASE_URL

function warnMissingDatabase(): void {
  console.warn(
    'VITE_DATABASE_URL is not set. Neon is disabled and data queries will return empty results.',
  )
}

type SqlClient = any

function createEmptySql(): SqlClient {
  const tag = async () => []
  return new Proxy(tag, {
    get(target, prop) {
      if (prop === 'transaction') {
        return async (callback: (sql: any) => Promise<any> | any[]) => callback(tag)
      }
      if (prop === 'query') {
        return async () => ({ rows: [] })
      }
      return Reflect.get(target, prop)
    },
  }) as SqlClient
}

export const sql: SqlClient = databaseUrl ? neon(databaseUrl, { disableWarningInBrowsers: true }) : createEmptySql()

if (!databaseUrl) {
  warnMissingDatabase()
}
