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

export enum NumberTypes {
    number = 'number',
    percent = 'percent',
    money = 'money'
}

/* Output formatters by field type */
export const NumberInputFormat = {
    [NumberTypes.number]: function number(value: number, digits = 0, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true)
    },
    [NumberTypes.money]: function money(value: number, digits = 2, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true)
    },
    [NumberTypes.percent]: function percent(value: number, digits = 0, nullable = true) {
        if (value === null && nullable) {
            return ''
        }
        return getFormattedNumber(value || 0, digits, true) + ' %'
    }
}

/**
 * TODO
 *
 * @param value
 * @param digits
 * @param useGrouping
 */
export function getFormattedNumber(value: number, digits: number, useGrouping = false): string {
    const precision = getPrecision(digits)
    let result = Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        useGrouping: useGrouping
    }).format(fractionsRound(value, precision))
    // NumberFormat might return negative zero
    if (!precision && value < 0 && !result.match(/[1-9]/)) {
        result = result.replace('-', '')
    }

    return result
}

/**
 * Rounding to the nearest value of specified precision
 *
 * @param value
 * @param precision
 */
export function fractionsRound(value: number, precision: number): number {
    if (value == null || isNaN(value) || !precision) {
        return value
    }
    // Fraction offsetting
    const [mant, exp] = value.toString(10).split('e')
    const val: number = Math.round(Number(mant + 'e' + (exp ? Number(exp) + precision : precision)))
    // Reverse offsetting
    const [rmant, rexp] = val.toString(10).split('e')
    return Number(rmant + 'e' + (rexp ? Number(rexp) - precision : -precision))
}

/**
 * TODO
 *
 * @param digits
 */
export function getPrecision(digits: number): number {
    let precision = 0
    // calculate target precision based on maximally allowed by Intl formatting
    if (digits) {
        precision = digits < 0 ? 0 : digits > 20 ? 20 : Math.ceil(digits)
    }
    return precision
}
