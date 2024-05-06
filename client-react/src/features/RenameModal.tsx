import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import store, { IRootState } from '../store'
import { setKeyLock } from '../store/transactionsSlice.tsx'
import { useNavigate } from 'react-router-dom'
import { remote } from '../../../rpc/rpc.ts'
import { Offcanvas } from 'bootstrap'

export function RenameModal() {
    const dispatch = useDispatch()
    const inputElement = useRef<HTMLInputElement>(null)
    const transactions = useSelector((state: IRootState) => state.transactions)
    const table = useRef(transactions.table)
    const navigate = useNavigate()

    useEffect(() => {
        const myOffcanvas = document.getElementById('renameModal')
        if (myOffcanvas) {
            myOffcanvas.addEventListener('show.bs.offcanvas', () => {
                table.current = store.getState().transactions.table
                if (inputElement.current) {
                    inputElement.current.value = table.current
                }
                dispatch(setKeyLock(true))
            })
            myOffcanvas.addEventListener('hidden.bs.offcanvas', () => {
                dispatch(setKeyLock(false))
            })
        }
    }, [])

    async function renameTable() {
        if (inputElement.current) {
            console.log(
                'rename',
                table.current,
                '->',
                inputElement.current.value
            )
            await remote.rename_table(table.current, inputElement.current.value)
            const myOffcanvas = document.getElementById('renameModal')
            if (myOffcanvas) {
                Offcanvas.getInstance(myOffcanvas)?.hide()
            }
            navigate(`/table/${inputElement.current.value}`)
        }
    }

    return (
        <>
            <div className="d-inline">
                <button
                    className="btn btn-outline-primary"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#renameModal"
                    aria-controls="renameModal"
                >
                    Rename
                </button>
            </div>

            <div
                className="offcanvas offcanvas-start"
                // tabIndex="-1"
                id="renameModal"
                aria-labelledby="renameModalTitle"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="renameModalTitle">
                        Rename Table
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <input
                        type="text"
                        ref={inputElement}
                        className="form-control"
                        id="recipient-name"
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={renameTable}
                    >
                        Rename
                    </button>
                </div>
            </div>
        </>
    )
}