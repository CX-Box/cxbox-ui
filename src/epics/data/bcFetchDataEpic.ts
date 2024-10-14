/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { catchError, concat, EMPTY, filter, mergeMap, Observable, of, race } from 'rxjs'
import { AnyAction } from 'redux'
import { buildBcUrl, checkShowCondition, getBcChildren, getFilters, getSorters } from '../../utils'
import { cancelRequestActionTypes, cancelRequestEpic } from '../../utils/cancelRequestEpic'
import { DataItem, WidgetTypes } from '@cxbox-ui/schema'
import { BcMetaState, CXBoxEpic, PopupData, PopupWidgetTypes, WidgetMeta } from '../../interfaces'
import { isAnyOf } from '@reduxjs/toolkit'
import {
    bcChangeCursors,
    bcChangePage,
    bcClearData,
    bcFetchDataFail,
    bcFetchDataPages,
    bcFetchDataRequest,
    bcFetchDataSuccess,
    bcFetchRowMeta,
    bcForceUpdate,
    bcSelectRecord,
    showViewPopup
} from '../../actions'
import { createApiErrorObservable } from '../../utils/apiError'

/**
 *
 *
 * Loads BC's dataEpics.ts.
 * In case successful download:
 * - dispatches action to store
 * - initializes rowMeta load
 * - initializes child BCs dataEpics.ts load
 *
 * action.payload.bcName BC's name for dataEpics.ts load
 *
 * @category Epics
 */
export const bcFetchDataEpic: CXBoxEpic = (action$, state$, { api }) =>
    action$.pipe(
        filter(isAnyOf(bcFetchDataRequest, bcFetchDataPages, showViewPopup, bcForceUpdate, bcChangePage)),
        mergeMap(action => {
            const state = state$.value
            const { widgetName = '' } = action.payload
            const { widgets, infiniteWidgets } = state.view

            const widgetsWithCurrentBc = widgets?.filter(item => item.bcName === action.payload.bcName)
            /**
             * TODO: Widget name will be mandatory in 2.0.0 but until then collision-vulnerable fallback is provided
             * through business component match
             */
            const widget = widgets?.find(item => item.name === widgetName) ?? widgetsWithCurrentBc?.[0]
            /**
             * Missing widget means the view or screen were changed and dataEpics.ts request is no longer relevant
             */
            if (!widget) {
                return EMPTY
            }
            const bcName = action.payload.bcName as string
            const bc = state.screen.bo.bc[bcName]
            const { cursor, page = 1 } = bc
            const limit = (widgets?.find(i => i.bcName === bcName)?.limit || bc.limit) ?? 5
            const sorters = state.screen.sorters[bcName]
            /**
             * If popup has the same bc as initiator no dataEpics.ts fetching required, it will be
             * handled by initiator widget instead
             */
            if (showViewPopup.match(action) && bcName === action.payload.calleeBCName) {
                return EMPTY
            }

            const anyHierarchyWidget = widgets?.find(item => {
                return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && isHierarchyWidget(item)
            })
            const fullHierarchyWidget = state.view.widgets?.find(item => {
                return item.bcName === widget.bcName && item.type === WidgetTypes.AssocListPopup && item.options?.hierarchyFull
            })

            const limitBySelfCursor = state.router.bcPath?.includes(`${bcName}/${cursor}`)
            const bcUrl = buildBcUrl(bcName, limitBySelfCursor, state)

            // Hierarchy widgets has own filter implementation
            const fetchParams: Record<string, any> = {
                _page: page,
                _limit: limit,
                ...getFilters(fullHierarchyWidget ? [] : state.screen.filters[bcName] || []),
                ...getSorters(sorters)
            }

            if (bcForceUpdate.match(action)) {
                const infinityPaginationWidget =
                    (widgetName && infiniteWidgets?.includes(widgetName)) ||
                    widgets?.filter(item => item.bcName === bcName)?.find(item => infiniteWidgets?.includes(item.name))?.name
                if (infinityPaginationWidget) {
                    fetchParams._page = 1
                    fetchParams._limit = limit * page
                }
            }

            if (bcFetchDataPages.match(action)) {
                fetchParams._page = action.payload.from || 1
                fetchParams._limit = (action.payload.to || page - fetchParams._page) * limit
            }
            if ((bcFetchDataRequest.match(action) && action.payload.ignorePageLimit) || anyHierarchyWidget?.options?.hierarchyFull) {
                fetchParams._limit = 0
            }
            const canceler = api.createCanceler()
            const cancelFlow = cancelRequestEpic(action$, cancelRequestActionTypes, canceler.cancel, bcFetchDataFail({ bcName, bcUrl }))
            const cancelByParentBc = cancelRequestEpic(
                action$,
                [bcSelectRecord],
                canceler.cancel,
                bcFetchDataFail({ bcName, bcUrl }),
                filteredAction => {
                    const actionBc = filteredAction.payload.bcName
                    return bc.parentName === actionBc
                }
            )

            const normalFlow = api.fetchBcData(state.screen.screenName, bcUrl, fetchParams, canceler.cancelToken).pipe(
                mergeMap(response => {
                    const cursorChange = getCursorChange(action, response.data, cursor, !!anyHierarchyWidget)
                    const setDataSuccess = of(
                        bcFetchDataSuccess({
                            bcName,
                            data: response.data,
                            bcUrl,
                            hasNext: response.hasNext
                        })
                    )
                    const isWidgetVisible = (w: WidgetMeta) => {
                        // check whether BC names from action payload, showCondition and current widget are relatives
                        // if positive check skip `checkShowCondition` call
                        if (w.showCondition?.bcName === state.screen.bo.bc[w.bcName]?.parentName) {
                            let parentName = state.screen.bo.bc[w.showCondition?.bcName]?.parentName
                            let parent = parentName === bcName
                            while (!parent && parentName) {
                                parentName = state.screen.bo.bc[parentName]?.parentName
                                parent = parentName === bcName
                            }
                            if (parent) {
                                return true
                            }
                        }
                        const dataToCheck =
                            bcName === w.showCondition?.bcName ? response.data : state.data[w.showCondition?.bcName as string]
                        return checkShowCondition(
                            w.showCondition,
                            state.screen.bo.bc[w.showCondition?.bcName as string]?.cursor,
                            dataToCheck,
                            state.view.pendingDataChanges
                        )
                    }

                    if (!isVisibleBc(bcName, widgets, state.screen.bo.bc, state.view.popupData, isWidgetVisible)) {
                        return setDataSuccess
                    }
                    const fetchChildren = response.data?.length
                        ? getChildrenData(action, widgets, state.screen.bo.bc, !!anyHierarchyWidget, isWidgetVisible)
                        : EMPTY
                    const fetchRowMeta = of(bcFetchRowMeta({ widgetName, bcName }))
                    const resetOutdatedData = resetOutdatedChildrenData(bcName, state.screen.bo.bc, state.data)

                    return concat(cursorChange, resetOutdatedData, setDataSuccess, fetchRowMeta, fetchChildren)
                }),
                catchError((error: any) => {
                    console.error(error)
                    return concat(of(bcFetchDataFail({ bcName: action.payload.bcName as string, bcUrl })), createApiErrorObservable(error))
                })
            )

            return race(cancelFlow, cancelByParentBc, normalFlow)
        })
    )

/**
 * Determines if the argument is hierarchy widget
 *
 * TODO: Should be typeguard when hierarchy widgets will have actual distinct interfaces
 *
 * @param widget Widget to check
 * @returns `true` if widget option `hierarchy` or `hierarchyFull` is set; `else` otherwise
 */
function isHierarchyWidget(widget: WidgetMeta) {
    return widget.options?.hierarchy || widget.options?.hierarchyFull
}

const getCursorChange = (action: AnyAction, data: DataItem[], prevCursor: string, isHierarchy: boolean) => {
    const { bcName } = action.payload
    const keepDelta = bcFetchDataRequest.match(action) ? action.payload.keepDelta : undefined
    const newCursor = data[0]?.id
    const cursorShouldChange = !data.some(i => i.id === prevCursor)
    return cursorShouldChange
        ? of(
              bcChangeCursors({
                  cursorsMap: {
                      [bcName as string]: newCursor
                  },
                  keepDelta: isHierarchy || keepDelta
              })
          )
        : EMPTY
}

const isPopupWidget = (type: string) => PopupWidgetTypes.includes(type)

const getChildrenData = (
    action: AnyAction,
    widgets: WidgetMeta[],
    bcDictionary: Record<string, BcMetaState>,
    isHierarchy: boolean,
    showConditionCheck: (widget: WidgetMeta) => boolean
) => {
    const { bcName } = action.payload

    return concat(
        ...Object.entries(getBcChildren(bcName as string, widgets, bcDictionary)).reduce<Array<Observable<AnyAction>>>(
            (acc, [childBcName, widgetNames]) => {
                const ignoreLazyLoad = showViewPopup.match(action)
                const nonLazyWidget = widgets.find(item => {
                    return widgetNames.includes(item.name) && !isPopupWidget(item.type) && showConditionCheck(item)
                })

                if (nonLazyWidget || ignoreLazyLoad) {
                    acc.push(
                        of(
                            bcFetchDataRequest({
                                bcName: childBcName,
                                widgetName: nonLazyWidget?.name as string,
                                ignorePageLimit: action.payload?.ignorePageLimit || showViewPopup.match(action),
                                keepDelta: isHierarchy || action.payload?.keepDelta
                            })
                        )
                    )
                }

                return acc
            },
            []
        )
    )
}

const resetOutdatedChildrenData = (bcName: string, bcDictionary: Record<string, BcMetaState>, data: Record<string, DataItem[]>) => {
    const parentBcNames = [bcName]
    const parentsBcUrls = parentBcNames.map(parentBcName => `${bcDictionary[parentBcName].url}/:id`)
    const childBcNamesWithData = Object.keys(data).reduce<string[]>((acc, bcNameWithData) => {
        const bc = bcDictionary[bcNameWithData]
        if (parentsBcUrls.some(item => bc.url.includes(item))) {
            acc.push(bc.name)
        }

        return acc
    }, [])

    return childBcNamesWithData.length
        ? of(
              bcClearData({
                  bcNames: childBcNamesWithData
              })
          )
        : EMPTY
}

/**
 * Checks if there is at least one visible widget with originBc or any child bc to it.
 * The check takes into account the visibility of popup widgets.
 */
function isVisibleBc(
    originBcName: string,
    widgets: WidgetMeta[],
    bcDictionary: Record<string, BcMetaState>,
    popupData: PopupData,
    showConditionCheck: (widget: WidgetMeta) => boolean
) {
    const bcWidgetsMap = widgets.reduce<Record<string, WidgetMeta[]>>((acc, widget) => {
        if (!widget.bcName) return acc

        if (!Array.isArray(acc[widget.bcName])) {
            acc[widget.bcName] = []
        }

        acc[widget.bcName].push(widget)

        return acc
    }, {})
    const bcListOnCurrentView = Object.keys(bcWidgetsMap)
    const originBcIsOnCurrentView = bcListOnCurrentView.includes(originBcName)

    const leastOneWidgetIsVisible = (currentBcName: string) =>
        !!bcWidgetsMap[currentBcName]?.some(widget => {
            const isVisiblePopup = popupData?.bcName === widget.bcName

            return (showConditionCheck(widget) && !isPopupWidget(widget.type)) || isVisiblePopup
        })

    if (originBcIsOnCurrentView && leastOneWidgetIsVisible(originBcName)) {
        return true
    }

    const isChildBcForOriginBc = (bcName: string) => {
        const partUrlOfChildBc = `${bcDictionary[originBcName].url}/:id`
        return bcDictionary[bcName].url.includes(partUrlOfChildBc)
    }

    return bcListOnCurrentView.some(bcName => {
        return isChildBcForOriginBc(bcName) ? leastOneWidgetIsVisible(bcName) : false
    })
}
