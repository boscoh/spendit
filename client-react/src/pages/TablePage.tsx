import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../store/store.ts'
import { setFilterCategory } from '../store/transactionsSlice.tsx'

import { remote, saveTextFile } from '../../../rpc/rpc.ts'

import { NavBar } from '../features/NavBar.tsx'
import { TransactionTable } from '../features/TransactionTable.tsx'
import { CategoryPlot } from '../features/CategoryPlot.tsx'
import { SummaryPanel } from '../features/SummaryPanel.tsx'
import { AutofillPanel } from '../features/AutofillPanel.tsx'
import { fetchTable } from '../fetch.tsx'

function TablePage() {
    const dispatch = useDispatch()
    const transactions = useSelector((state: IRootState) => state.transactions)
    const params = useParams()

    useEffect(() => {
        if (params.table && params.table !== transactions.table) {
            fetchTable(params.table)
        }
    }, [params.table])

    function setCategoryFilter(filter: string) {
        dispatch(setFilterCategory(filter))
    }

    const options = [
        <option value={''} key={''}>
            -- all --
        </option>,
    ]
    for (const category of transactions.categories) {
        options.push(
            <option value={category.key} key={category.key}>
                only {category.key}
            </option>
        )
    }

    const selectFilter = (
        <select
            className="form-select"
            aria-label="Default select example"
            value={transactions.filterCategory}
            onChange={(e) => setCategoryFilter(e.target.value)}
        >
            {options}
        </select>
    )

    async function downloadCsv() {
        const response = await remote.get_csv(transactions.table)
        if ('result' in response) {
            saveTextFile(response.result, 'transactions.csv')
        }
    }

    return (
        <div className="d-flex flex-column">
            <NavBar></NavBar>

            <div
                style={{ height: 'calc(100vh - 56px)' }}
                className="pt-3 flex-grow-1 container-fluid d-flex flex-column"
            >
                <h1>Table: {transactions.table}</h1>

                <div style={{ width: '100%', height: '300px' }}>
                    <CategoryPlot />
                </div>

                <div className="d-flex flex-row gap-2 mb-2">
                    <AutofillPanel />
                    <SummaryPanel />
                    <div
                        className="btn btn-outline-primary"
                        onClick={downloadCsv}
                    >
                        CSV
                    </div>
                    <div>{selectFilter}</div>
                </div>

                <div className="flex-grow-1 card overflow-auto mb-3">
                    <div className="p-2">
                        <TransactionTable></TransactionTable>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TablePage
