import type {UseFetchOptions} from "#app";

export function useApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  return useFetch(url, {
    lazy: true,
    headers: useRequestHeaders(['cookie']),
    onResponseError: ({response}) => {
      if (import.meta.client && response.status === 401) {
        navigateTo('/login');
        return;
      }
    },
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch
  })
}