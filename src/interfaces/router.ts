
export { DrillDownType } from '@cxbox-ui/schema'

export interface Route {
    type: RouteType
    path: string
    params: Record<string, unknown>
    screenName?: string
    viewName?: string
    bcPath?: string
}

export enum RouteType {
    screen = 'screen',
    default = 'default',
    router = 'router',
    invalid = 'invalid',
    unknown = 'unknown'
}
