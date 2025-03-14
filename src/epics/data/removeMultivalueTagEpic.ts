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

import { concat, EMPTY, filter, mergeMap, of } from 'rxjs'
import { CXBoxEpic, PopupWidgetTypes, TreeAssociatedRecord } from '../../interfaces'
import { assignTreeLinks, buildBcUrl, getDescendants } from '../../utils'
import { changeDataItem, removeMultivalueTag } from '../../actions'

/**
 * For full hierarchies it fires `changeDataItem` action to remove value from source record
 *
 * With `hierarchyGroupDeselection` widget option, parent removal also remove children; removing
 * last child will also remove the parent.
 *
 * With `hierarchyTraverse` widget option, descendants are used instead of children.
 *
 * When parent should be removed with both option, `removeMultivalueTag` with updated `removedItem` will
 * fire instead of `changeDataItem`.
 *
 * For non-full hierarchies two `changeDataItem` actions will fire, first to drop `_associate` flag
 * of remove item and second to update value of source record.
 * Widget options are not tested for non-full hierarchies.
 */
export const removeMultivalueTagEpic: CXBoxEpic = (action$, state$) =>
    action$.pipe(
        filter(removeMultivalueTag.match),
        mergeMap(action => {
            /**
             * Default implementation for `removeMultivalueTag` epic
             *
             * For full hierarchies it fires `changeDataItem` action to remove value from source record
             *
             * With `hierarchyGroupDeselection` widget option, parent removal also remove children; removing
             * last child will also remove the parent.
             *
             * With `hierarchyTraverse` widget option, descendants are used instead of children.
             *
             * When parent should be removed with both option, `removeMultivalueTag` with updated `removedItem` will
             * fire instead of `changeDataItem`.
             *
             * For non-full hierarchies two `changeDataItem` actions will fire, first to drop `_associate` flag
             * of remove item and second to update value of soure record.
             * Widget options are not tested for non-full hierarchies.
             *
             */

            const state = state$.value
            const { bcName, cursor, popupBcName, associateFieldKey } = action.payload
            const widget = state.view.widgets.find(item => item.bcName === popupBcName && PopupWidgetTypes.includes(item.type))
            const storeData = (state?.data[popupBcName] || []) as unknown as TreeAssociatedRecord[]
            // Merge store dataEpics.ts with pending changes
            let data: TreeAssociatedRecord[] = storeData.map(item => {
                const pendingChanges = state.view.pendingDataChanges[popupBcName]?.[item.id]
                return { ...item, ...pendingChanges }
            })
            const removedItem = data.find(item => item.id === action.payload.removedItem.id)
            /**
             * It seems `_associate` is always false for full hierarchies
             * so we rely on source record value instead
             */
            const associated = action.payload.dataItem.map(item => item.id)
            let removedNodes: string[] = []
            if (widget?.options?.hierarchyGroupDeselection) {
                // Builds a tree to simplify searching of descendants
                if (widget?.options?.hierarchyTraverse) {
                    data = assignTreeLinks(data)
                }
                const removedItemChildren = data.filter(item => item.parentId === removedItem?.id)
                removedNodes = [removedItem?.id, ...removedItemChildren.filter(item => associated.includes(item.id)).map(item => item.id)]
                if (widget?.options?.hierarchyTraverse) {
                    getDescendants(removedItemChildren, removedNodes)
                    removedNodes = data.filter(item => removedNodes.includes(item.id) && associated.includes(item.id)).map(item => item.id)
                }
                const parent = data.find(item => item.id === removedItem?.parentId)
                const siblings = data.filter(item => item.parentId === parent?.id)
                const parentEmpty = siblings.every(child => removedNodes.includes(child.id) || !associated.includes(child.id))
                // If last child/descendant removed, parent also should be
                if (parent && parentEmpty) {
                    // Last descendant
                    if (widget?.options?.hierarchyTraverse) {
                        const parentDescendants: string[] = []
                        getDescendants(siblings, parentDescendants)
                        const parentDeepEmpty = parentDescendants.every(descendant => {
                            return removedNodes.includes(descendant) || !associated.includes(descendant)
                        })
                        if (parentDeepEmpty) {
                            return concat(
                                of(
                                    removeMultivalueTag({
                                        ...action.payload,
                                        removedItem: { id: parent.id, value: null }
                                    })
                                )
                            )
                        }
                    } else {
                        // Last child
                        removedNodes.push(parent.id)
                    }
                }
            }
            // Full hierarchies just filter out selected records
            if (widget?.options?.hierarchyFull) {
                return of(
                    changeDataItem({
                        bcName,
                        bcUrl: buildBcUrl(bcName, true, state),
                        cursor,
                        dataItem: { [associateFieldKey]: action.payload.dataItem.filter(item => !removedNodes.includes(item.id)) }
                    })
                )
            }
            const disableSecondDataChangeForAssocPopup =
                state.session.disableDeprecatedFeatures?.secondDataChangeForAssocPopupWhenRemovingTagFromField

            // Non-full hierarchies drops removed item's `_associate` flag`
            // And also updates source record value
            if (widget?.options?.hierarchy) {
                const hierarchyBcName =
                    widget?.options?.hierarchy?.find(hierarchyData => {
                        return state.view.pendingDataChanges[hierarchyData.bcName]?.[action.payload.removedItem.id]
                    })?.bcName ?? bcName

                return concat(
                    disableSecondDataChangeForAssocPopup
                        ? EMPTY
                        : of(
                              changeDataItem({
                                  /**
                                   * This is incorrect and will break if different BC has records with
                                   * identical ids.
                                   *
                                   * TODO: Record `level` should be mapped to hierarchyData index instead
                                   */
                                  bcName: hierarchyBcName,
                                  bcUrl: buildBcUrl(hierarchyBcName, true, state),

                                  cursor: action.payload.removedItem.id,
                                  dataItem: { ...(action.payload.removedItem as any), _associate: false }
                              })
                          ),
                    of(
                        changeDataItem({
                            bcName,
                            bcUrl: buildBcUrl(bcName, true, state),
                            cursor,
                            dataItem: { [associateFieldKey]: action.payload.dataItem }
                        })
                    )
                )
            }
            // Non hierarchies drops removed item's `_associate` flag` from popup BC
            // And also updates source record value
            return concat(
                disableSecondDataChangeForAssocPopup
                    ? EMPTY
                    : of(
                          changeDataItem({
                              bcName: popupBcName,
                              bcUrl: buildBcUrl(popupBcName, true, state),
                              cursor: action.payload.removedItem.id,
                              dataItem: { ...(action.payload.removedItem as any), _associate: false }
                          })
                      ),
                of(
                    changeDataItem({
                        bcName,
                        bcUrl: buildBcUrl(bcName, true, state),
                        cursor,
                        dataItem: { [associateFieldKey]: action.payload.dataItem }
                    })
                )
            )
        })
    )
