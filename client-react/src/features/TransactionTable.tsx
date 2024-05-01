import {remote} from '../../../rpc/rpc.ts'
import {useDispatch, useSelector} from 'react-redux'
import {setCategory, ITransactions} from '../store/transactionsSlice.tsx'
import _ from 'lodash'
import {ReactElement} from 'react'
import {DateTime} from 'luxon'
import {IRootState} from "../store/store.ts";

// function getNext<T>(x: T, xVals: T[]) {
//     const i = xVals.indexOf(x)
//     const iNext = i < xVals.length - 1 ? i + 1 : 0
//     return xVals[iNext]
// }

export function TransactionTable() {
    const transactions:ITransactions = useSelector((state: IRootState) => state.transactions)
    const dispatch = useDispatch()

    // Skip the first column as it contains the ID
    // Assume the last row is the category

    const showHeaders = _.slice(transactions.headers, 1, transactions.headers.length)
    const trHeader = showHeaders.map((k) => <th key={k}>{k}</th>)

    const descByCategory = _.mapValues(_.keyBy(transactions.categories, 'key'), 'desc')

    async function changeCategory(id: string, category: string) {
        console.log('changeCategory', id, category)
        dispatch(setCategory({ id, category }))
        await remote.update_transactions(transactions.table, id, { category })
    }

    const trRows = []
    const iLast = transactions.headers.length - 1
    for (const row of transactions.rows) {
        if (transactions.filterCategory) {
            if (_.last(row) !== transactions.filterCategory) {
                continue
            }
        }
        // format each column specifially
        const tdList: ReactElement[] = []
        row.forEach((v, i) => {
            if (i === 0) {
                // skip the id
                return
            }
            if (i === 1) {
                v = DateTime.fromISO(v).toFormat('ddLLLyy')
            }
            let td
            if (i === iLast) {
                if (v in descByCategory) {
                    v += ' - ' + descByCategory[v]
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
                    <td className={'user-select-none'} key={i}>
                        {select}
                    </td>
                )
            } else {
                td = (
                    <td className={'user-select-none'} key={i}>
                        {v}
                    </td>
                )
            }
            tdList.push(td)
        })
        trRows.push(<tr key={row[0]}>{tdList}</tr>)
    }

    return (
        <table className="table">
            <thead>
                <tr>{trHeader}</tr>
            </thead>
            <tbody>{trRows}</tbody>
        </table>
    )
}
