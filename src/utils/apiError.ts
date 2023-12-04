import { AxiosError } from 'axios'
import { actions } from '@cxbox-ui/core'
import { EMPTY, of } from 'rxjs'

interface ApiCallContext {
    widgetName: string
}

export function createApiError(error: AxiosError, context: ApiCallContext = { widgetName: 'unknown' }) {
    if (!error.isAxiosError) return undefined

    return actions.apiError({ error, callContext: context })
}

export function createApiErrorObservable(error: AxiosError, context?: ApiCallContext) {
    const apiError = createApiError(error, context)
    return apiError ? of(apiError) : EMPTY
}
