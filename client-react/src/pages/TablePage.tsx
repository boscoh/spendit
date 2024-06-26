import { ChangeEvent, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {deleteReport, downloadCsv, IRootState, loadReport, updateReportName} from '../store'
import { set } from '../store/transactionsSlice.tsx'

import NavBar from '../features/NavBar.tsx'
import TransactionTable from '../features/TransactionTable.tsx'
import CategoryPlot from '../features/CategoryPlot.tsx'
import SummaryPanel from '../features/SummaryPanel.tsx'
import AutofillPanel from '../features/AutofillPanel.tsx'
import EditBox from '../features/EditBox.tsx'

function TablePage() {
    const dispatch = useDispatch()
    const transactions = useSelector((state: IRootState) => state.transactions)
    const params = useParams()
    const navigate = useNavigate()

    const options = [
        { key: '', desc: '-- all --' },
        ...transactions.categories.map((c) => ({
            key: c.key,
            desc: `only ${c.key}`,
        })),
    ]

    useEffect(() => {
        if (params.table && params.table !== transactions.table) {
            loadReport(params.table)
        }
    }, [])

    function setFilter(e: ChangeEvent<HTMLSelectElement>) {
        dispatch(set({ filterCategory: e.target.value }))
    }

    async function onDelete() {
        await deleteReport()
        navigate('/')
    }

    async function onRename(newTable: string) {
        await updateReportName(newTable)
        navigate(`/table/${newTable}`)
    }

    return (
        <div className="d-flex flex-column">
            <NavBar></NavBar>

            <div
                style={{ height: 'calc(100vh - 56px)' }}
                className="pt-3 flex-grow-1 container-fluid d-flex flex-column"
            >
                <div className="d-flex flex-row justify-content-between align-items-center">
                    <EditBox
                        text={transactions.table}
                        handleText={onRename}
                    ></EditBox>
                    <button
                        className="btn btn-outline-primary"
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                </div>

                <div style={{ width: '100%', height: '300px' }}>
                    <CategoryPlot />
                </div>

                <div className="d-flex flex-row gap-2 my-2">
                    <AutofillPanel />
                    <SummaryPanel />
                    <div
                        className="btn btn-outline-primary"
                        onClick={downloadCsv}
                    >
                        CSV
                    </div>
                    <div>
                        {
                            <select
                                className="form-select"
                                value={transactions.filterCategory}
                                onChange={setFilter}
                            >
                                {options.map(({ key, desc }) => (
                                    <option value={key} key={key}>
                                        {desc}
                                    </option>
                                ))}
                            </select>
                        }
                    </div>
                </div>

                <div className="flex-grow-1 card overflow-auto mb-3">
                    <TransactionTable />
                </div>
            </div>
        </div>
    )
}

export default TablePage
