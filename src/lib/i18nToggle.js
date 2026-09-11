import { T } from './i18n.js'
import { getState } from './store.js'

export function t(key) {
  const lang = getState().lang || 'en'
  return (T[lang] && T[lang][key]) || T.en[key] || key
}
