import useSWR from 'swr'

function useFetch(...args) {
  const [params, options] = args

  const [url, query = {}] = params
  const queryObject = new URLSearchParams(query)
  const newQuery = queryObject.toString()
  const newUrl = newQuery ? `${url}?${newQuery}` : url

  const { data, error, isValidating, mutate } = useSWR(url ? newUrl : null, options)

  return { data, error, isValidating, mutate }
}

export default useFetch
