import { ref, shallowRef, watch, type Ref, type ShallowRef, type WatchSource } from 'vue'

import { i18n } from '@/i18n'

export interface AsyncData<T> {
  data: ShallowRef<T | null>
  error: ShallowRef<unknown>
  loading: Ref<boolean>
  reload: () => Promise<void>
}

/**
 * Loads data now and again whenever the locale or any of the given sources change.
 * Responses that arrive after a newer request started are ignored.
 */
export function useAsyncData<T>(load: () => Promise<T>, sources: WatchSource[] = []): AsyncData<T> {
  const data = shallowRef<T | null>(null)
  const error = shallowRef<unknown>(null)
  const loading = ref(true)
  let latestRequest = 0

  async function reload(): Promise<void> {
    const request = ++latestRequest
    loading.value = true
    error.value = null

    try {
      const result = await load()

      if (request === latestRequest) {
        data.value = result
      }
    } catch (caught) {
      if (request === latestRequest) {
        error.value = caught
      }
    } finally {
      if (request === latestRequest) {
        loading.value = false
      }
    }
  }

  watch([() => i18n.global.locale.value, ...sources], reload, { immediate: true })

  return { data, error, loading, reload }
}
