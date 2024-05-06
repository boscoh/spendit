import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../store'
import { setFilterOfCategory, setKeyLock } from '../store/transactionsSlice.tsx'
import _ from 'lodash'
import { autofill } from '../fetch.tsx'

export function AutofillPanel() {
    const transactions = useSelector((state: IRootState) => state.transactions)
    const dispatch = useDispatch()

    function lockKey() {
        dispatch(setKeyLock(true))
    }

    function unlockKey() {
        dispatch(setKeyLock(false))
    }

    function changeFilter(categoryKey: string, filter: string) {
        dispatch(setFilterOfCategory({ categoryKey, filter }))
    }

    const categories = _.map(transactions.categories, (category) => (
        <div key={category.key}>
            <div className="d-flex flex-row mb-3">
                <label className="mt-2" htmlFor={category + 'Form'}>
                    {category.key}
                </label>
                <textarea
                    value={category.filter ? category.filter : ''}
                    onChange={(e) => changeFilter(category.key, e.target.value)}
                    className="ms-2 form-control"
                    id="category + 'Form'"
                    onBlur={unlockKey}
                    onFocus={lockKey}
                    rows={3}
                ></textarea>
            </div>
        </div>
    ))

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
                <div className="offcanvas-body">{categories}</div>
            </div>
        </div>
    )
}
