import { fromComment, fromObject } from 'convert-source-map'

const SOURCEMAPPING_URL = 'sourceMappingURL'
const SOURCEMAP_REG = new RegExp(`^\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'gm')

export function appendInlineSourceMap(code: string, sourceMap: any) {
    if (sourceMap) {
        const mapping = fromObject(sourceMap)
        return `${code}\n${mapping.toComment()}`
    } else {
        return code
    }
}
export function extractInlineSourceMap(code: string) {
    return fromComment(code.match(SOURCEMAP_REG)?.[0]).toObject()
}

export function removeInlineSourceMap(code: string) {
    return code.replace(new RegExp(`^\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'gm'), '')
}
