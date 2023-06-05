import { AxiosError } from 'axios'
import { apiError } from '../actions'
import { EMPTY, of } from 'rxjs'

interface ApiCallContext {
    widgetName: string
}

export function createApiError(error: AxiosError, context: ApiCallContext = { widgetName: 'unknown' }) {
    if (!error.isAxiosError) return undefined

    return apiError({ error, callContext: context })
}

export function createApiErrorObservable(error: AxiosError, context?: ApiCallContext) {
    const newApiError = createApiError(error, context)
    return newApiError ? of(newApiError) : EMPTY
}
