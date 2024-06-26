import { useDispatch, useSelector } from 'react-redux'
import {autofill, IRootState} from '../store'
import { set, setCategoryFilter } from '../store/transactionsSlice.tsx'
import _ from 'lodash'

export default function AutofillPanel() {
    const transactions = useSelector((state: IRootState) => state.transactions)
    const dispatch = useDispatch()

    function lockKey() {
        dispatch(set({ keyLock: true }))
    }

    function unlockKey() {
        dispatch(set({ keyLock: false }))
    }

    function changeFilter(categoryKey: string, filter: string) {
        dispatch(setCategoryFilter({ categoryKey, filter }))
    }

    return (
        <div>
            <div className="d-inline">
                <button
                    className="btn btn-outline-primary"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasExample"
                    aria-controls="offcanvasExample"
                >
                    Autofill
                </button>
            </div>

            <div
                className="offcanvas offcanvas-start"
                // tabIndex="-1"
                id="offcanvasExample"
                aria-labelledby="autofillPanel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="autofillPanel">
                        Autofill panel
                    </h5>
                    <div className="px-2"></div>
                    <button
                        className="btn btn-outline-primary"
                        onClick={autofill}
                    >
                        Recalculate
                    </button>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    {_.map(transactions.categories, (category) => (
                        <div key={category.key}>
                            <div className="d-flex flex-row mb-3">
                                <label
                                    className="mt-2"
                                    htmlFor={category + 'Form'}
                                >
                                    {category.key}
                                </label>
                                <textarea
                                    value={
                                        category.filter ? category.filter : ''
                                    }
                                    onChange={(e) =>
                                        changeFilter(
                                            category.key,
                                            e.target.value
                                        )
                                    }
                                    className="ms-2 form-control"
                                    id="category + 'Form'"
                                    onBlur={unlockKey}
                                    onFocus={lockKey}
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
