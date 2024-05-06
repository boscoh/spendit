import {remote} from '../../../rpc/rpc.ts'
import {ReactElement, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {ITransactions, updateCategory} from '../store/transactionsSlice.tsx'
import _ from 'lodash'
import {DateTime} from 'luxon'
import store, {IRootState} from '../store'

export function TransactionTable() {
    const dispatch = useDispatch()
    const [iRowActive, setIRowActive] = useState<number>(0)
    const transactions = useSelector((state: IRootState) => state.transactions)

    useEffect(() => {
        if (transactions.clickTransaction) {
            const time = transactions.clickTransaction.time
            const category = transactions.clickTransaction.category
            const rows = transactions.rows

            for (let i = 0; i < rows.length; i += 1) {
                const row = rows[i]
                if (time === row[1] && category === _.last(row)) {
                    const targetId = row[0]
                    const div = document.getElementById(targetId)
                    console.log('found click div', div)
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
        await remote.update_transactions(transactions.table, id, {category})
        dispatch(updateCategory({id, category}))
    }

    function getRow(transactions: ITransactions, iRowSelect: number) {
        let iRow = 0
        for (const row of transactions.rows) {
            if (transactions.filterCategory) {
                if (_.last(row) !== transactions.filterCategory) {
                    continue
                }
            }
            if (iRow === iRowSelect) {
                return row
            }
            iRow += 1
        }
        return null
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
            const row = getRow(transactions, iRowActive)
            if (row) {
                if (
                    _.find(transactions.categories, (c) => c.key === category)
                ) {
                    const id = row[0]
                    await remote.update_transactions(transactions.table, id, {
                        category,
                    })
                    dispatch(updateCategory({category, id}))
                }
            }
        }
    }

    const trRows = []
    const iLast = transactions.headers.length - 1
    for (const [iRow, row] of transactions.rows.entries()) {
        if (transactions.filterCategory) {
            if (_.last(row) !== transactions.filterCategory) {
                continue
            }
        }
        // format each column specifially
        const tdList: ReactElement[] = []
        let rowStyle = {}
        if (iRow === iRowActive) {
            rowStyle = {backgroundColor: '#ffe'}
        }
        row.forEach((v, i) => {
            let td
            if (i === iLast) {
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
                const select = (
                    <select
                        className="form-select"
                        value={row[i] ? row[i] : ''}
                        onChange={(e) => changeCategory(row[0], e.target.value)}
                    >
                        {options}
                    </select>
                )
                td = (
                    <td style={rowStyle} key={i}>
                        {select}
                    </td>
                )
            } else {
                if (i === 1) {
                    v = DateTime.fromISO(v).toFormat('ddLLLyy')
                }
                td = (
                    <td style={rowStyle} key={i}>
                        {v}
                    </td>
                )
            }
            tdList.push(td)
        })
        trRows.push(
            <tr
                id={row[0]}
                onClick={() => {
                    setIRowActive(iRow)
                }}
                key={row[0]}
            >
                {tdList}
            </tr>
        )
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
            <tbody>{trRows}</tbody>
        </table>
    )
}
