import { api } from '@/utils'

export default async function fetcher(url) {
  const { data } = await api.get(url)
  return data
}
