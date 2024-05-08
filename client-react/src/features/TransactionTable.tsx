import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../store'
import { updateCategory } from '../store/transactionsSlice.tsx'
import { remote } from '../../../rpc/rpc.ts'
import _ from 'lodash'
import { DateTime } from 'luxon'

export default function TransactionTable() {
    const [iRowActive, _setIRowActive] = useState<number>(0)
    const dispatch = useDispatch()
    const transactions = useSelector((state: IRootState) => state.transactions)
    const nCol = transactions.headers.length
    const iColLast = nCol - 1

    const iRowActiveRef = useRef(iRowActive)

    function setIRowActive(i: number) {
        iRowActiveRef.current = i
        _setIRowActive(i)
    }

    let rows = transactions.rows
    if (transactions.filterCategory) {
        rows = _.filter(
            rows,
            (row) => _.last(row) === transactions.filterCategory
        )
    }

    function gotoIRow(iRow: number) {
        const div = document.getElementById(rows[iRow][0])
        if (div) {
            div.scrollIntoView()
        }
    }

    useEffect(() => {
        if (transactions.clickTransaction) {
            const time = transactions.clickTransaction.time
            const category = transactions.clickTransaction.category

            for (let i = 0; i < rows.length; i += 1) {
                const row = rows[i]
                if (time === row[1] && category === _.last(row)) {
                    gotoIRow(i)
                    setIRowActive(i)
                }
            }
        }
    }, [transactions.clickTransaction])

    useEffect(() => {
        document.addEventListener('keydown', onKeydown)
        return () => {
            document.removeEventListener('keydown', onKeydown)
        }
    })

    async function onKeydown(event: KeyboardEvent) {
        const iRow = iRowActiveRef.current
        if (transactions.keyLock) {
            return
        }
        if (event.key === 'ArrowDown') {
            if (iRow === rows.length - 1) {
                setIRowActive(0)
            } else {
                setIRowActive(iRow + 1)
            }
        } else if (event.key === 'ArrowUp') {
            if (iRow === 0) {
                setIRowActive(rows.length - 1)
            } else {
                setIRowActive(iRow - 1)
            }
        } else {
            const category = event.key.toUpperCase()
            if (_.find(transactions.categories, (c) => c.key === category)) {
                const id = rows[iRowActive][0]
                await remote.update_transactions(transactions.table, id, {
                    category,
                })
                dispatch(updateCategory({ category, id }))
            }
        }
    }

    async function changeCategory(id: string, category: string) {
        await remote.update_transactions(transactions.table, id, { category })
        dispatch(updateCategory({ id, category }))
    }

    function formatValue(row: string[], iCol: number, id: string) {
        const val = row[iCol]
        if (iCol === 1) {
            return DateTime.fromISO(val).toFormat('ddLLLyy')
        }
        if (iCol !== iColLast) {
            return val
        }
        const options = [
            { key: '', desc: '-- select an option --' },
            ...transactions.categories.map((c) => ({
                key: c.key,
                desc: `${c.key} - ${c.desc}`,
            })),
        ]
        return (
            <select
                className="form-select"
                value={val ? val : ''}
                onChange={(e) => changeCategory(id, e.target.value)}
            >
                {options.map(({ key, desc }) => (
                    <option value={key} key={key}>
                        {desc}
                    </option>
                ))}
            </select>
        )
    }

    function rowStyle(iRow: number) {
        return iRow === iRowActive ? { backgroundColor: '#ffe' } : {}
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    {transactions.headers.map((k) => (
                        <th key={k}>{k}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, iRow) => (
                    <tr
                        id={row[0]}
                        key={row[0]}
                        onClick={() => setIRowActive(iRow)}
                    >
                        {_.range(0, nCol).map((iCol) => (
                            <td style={rowStyle(iRow)} key={iCol}>
                                {formatValue(row, iCol, row[0])}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
