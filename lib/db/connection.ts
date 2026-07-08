export function resolveDatabaseUrl(connectionString?: string) {
  if (!connectionString) return connectionString

  if (!connectionString.includes('neon.tech')) {
    return connectionString
  }

  const url = new URL(connectionString)
  const sslMode = url.searchParams.get('sslmode')

  if (!sslMode || sslMode === 'require' || sslMode === 'prefer' || sslMode === 'verify-ca') {
    url.searchParams.set('sslmode', 'verify-full')
  }

  return url.toString()
}
