import { useEffect, useState } from 'react'
import { subscribe, getState } from './store.js'

export function useStore() {
  const [db, setDb] = useState(getState)
  useEffect(() => subscribe(setDb), [])
  return db
}
