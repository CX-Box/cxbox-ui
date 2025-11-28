import { concat, EMPTY, of } from 'rxjs'
import { bcFetchRowMetaSuccess, drillDown, userDrillDownSuccess } from '../../actions'
import { DrillDownType, RowMeta, Store, WidgetFieldBase } from '../../interfaces'

const processUserDrillDown = (
    state: Store,
    rowMeta: RowMeta,
    fieldKey: string,
    cursor: string,
    bcName: string,
    bcUrl: string,
    fetchedRowMeta?: boolean
) => {
    const drillDownField = rowMeta.fields.find(field => field.key === fieldKey)
    const route = state.router
    const drillDownKey = (
        state.view.widgets
            .find(widget => widget.bcName === bcName)
            ?.fields.find((field: WidgetFieldBase) => field.key === fieldKey) as WidgetFieldBase
    )?.drillDownKey
    const customDrillDownUrl = state.data[bcName]?.find(record => record.id === cursor)?.[drillDownKey] as string
    /**
     * It seems that behavior is wrong here; matching route condition will probably never be hit
     *
     * TODO: Review this case and either make condition strict or remove it completely
     */
    return customDrillDownUrl || drillDownField?.drillDown || drillDownField?.drillDown !== route.path
        ? concat(
              fetchedRowMeta && drillDownField?.drillDownType !== DrillDownType.inner
                  ? of(bcFetchRowMetaSuccess({ bcName, rowMeta, bcUrl, cursor }))
                  : EMPTY,
              of(userDrillDownSuccess({ bcName, bcUrl, cursor })),
              of(
                  drillDown({
                      url: customDrillDownUrl || drillDownField.drillDown,
                      drillDownType: drillDownField.drillDownType as DrillDownType,
                      route
                  })
              )
          )
        : EMPTY
}

export default processUserDrillDown
