import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import store, { IRootState } from '../store'
import { updateCategory } from '../store/transactionsSlice.tsx'
import { remote } from '../../../rpc/rpc.ts'
import _ from 'lodash'
import { DateTime } from 'luxon'

export default function TransactionTable() {
    const dispatch = useDispatch()
    const [iRowActive, setIRowActive] = useState<number>(0)
    const transactions = useSelector((state: IRootState) => state.transactions)
    const nCol = transactions.headers.length
    const iColLast = nCol - 1
    let rows = transactions.rows
    if (transactions.filterCategory) {
        rows = _.filter(
            rows,
            (row) => _.last(row) === transactions.filterCategory
        )
    }

    useEffect(() => {
        if (transactions.clickTransaction) {
            const time = transactions.clickTransaction.time
            const category = transactions.clickTransaction.category

            for (let i = 0; i < rows.length; i += 1) {
                const row = rows[i]
                if (time === row[1] && category === _.last(row)) {
                    const div = document.getElementById(row[0])
                    if (div) {
                        div.scrollIntoView()
                        setIRowActive(i)
                    }
                }
            }
        }

        document.addEventListener('keydown', onKeydown)
        return () => {
            document.removeEventListener('keydown', onKeydown)
        }
    }, [iRowActive, transactions.clickTransaction])

    async function changeCategory(id: string, category: string) {
        await remote.update_transactions(transactions.table, id, { category })
        dispatch(updateCategory({ id, category }))
    }

    async function onKeydown(event: KeyboardEvent) {
        const state = store.getState()
        const transactions = state.transactions
        if (transactions.keyLock) {
            return
        }
        console.log('onKeydown', event.key, iRowActive)
        if (event.key === 'ArrowDown') {
            if (iRowActive === transactions.rows.length - 1) {
                setIRowActive(0)
            } else {
                setIRowActive(iRowActive + 1)
            }
        } else if (event.key === 'ArrowUp') {
            if (iRowActive == 0) {
                setIRowActive(transactions.rows.length - 1)
            } else {
                setIRowActive(iRowActive - 1)
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

    function formatValue(row: string[], iCol: number, id: string) {
        const val = row[iCol]

        if (iCol === 1) {
            return DateTime.fromISO(val).toFormat('ddLLLyy')
        }

        if (iCol !== iColLast) {
            return val
        }

        const options = [
            <option value="" key="">
                -- select an option --
            </option>,
        ]
        for (const category of transactions.categories) {
            options.push(
                <option value={category.key} key={category.key}>
                    {category.key} - {category.desc}
                </option>
            )
        }
        return (
            <select
                className="form-select"
                value={val ? val : ''}
                onChange={(e) => changeCategory(id, e.target.value)}
            >
                {options}
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
                            <td
                                style={rowStyle(iRow)}
                                key={iCol}
                            >
                                {formatValue(row, iCol, row[0])}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
