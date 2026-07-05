import { useEffect, useState } from 'react'

export function useNeonQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = [], initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    fetcher()
      .then((result) => {
        if (active) {
          setData(result)
          setError(null)
        }
      })
      .catch((error) => {
        if (active) {
          setError(error instanceof Error ? error.message : String(error))
          console.error('useNeonQuery error:', error)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, deps)

  return { data, error, loading }
}

