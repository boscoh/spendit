import { useSelector } from 'react-redux'
import { IRootState } from '../store'
import { ICategory } from '../store/transactionsSlice.tsx'
import { DateTime, Interval } from 'luxon'
import _ from 'lodash'

export default function SummaryPanel() {
    interface IInterval {
        nDay: number
        nWeek: number
        nMonth: number
    }

    const transactions = useSelector((state: IRootState) => state.transactions)
    let offsetDay = 0
    const interval = getInterval(transactions.rows, offsetDay)
    const summaries = getSummaries(
        transactions.rows,
        transactions.categories,
        interval
    )

    function changeOffset(newOFfset: string) {
        offsetDay = _.parseInt(newOFfset)
    }

    function getInterval(
        rows: (string | number)[][],
        offsetDay: number
    ): IInterval {
        const result = { nDay: 0, nWeek: 0, nMonth: 0 }
        if (!rows.length) {
            return result
        }

        const times: DateTime[] = []
        for (const row of rows) {
            if (typeof row[1] === 'string') {
                times.push(DateTime.fromISO(row[1]))
            }
        }

        times.sort((a, b) => b.toMillis() - a.toMillis())
        const last = _.last(times)
        const first = _.head(times)
        if (last && first) {
            const interval = Interval.fromDateTimes(last, first)
            result.nDay = interval.length('days') - offsetDay
            result.nWeek = result.nDay / 7
            result.nMonth = result.nDay / 30
        }
        return result
    }

    function getSummaries(
        rows: (string | number)[][],
        categories: ICategory[],
        interval: IInterval
    ) {
        if (!rows.length || !categories.length) {
            return []
        }
        const result = _.map(categories, (c) => {
            const dataset = {
                sum: 0,
                key: c.key,
                desc: c.key + ': ' + c.desc,
                sumDay: '0',
                sumMonth: '0',
                sumWeek: '0',
                sumYear: '0',
                sumTotal: '0',
            }
            for (const row of rows) {
                if (row[4] === c.key) {
                    if (typeof row[3] == 'number') {
                        dataset.sum = dataset.sum + row[3]
                    }
                }
            }
            return dataset
        })

        let extra = 0
        for (const row of rows) {
            if (!row[4]) {
                if (typeof row[3] == 'number') {
                    extra += row[3]
                }
            }
        }
        const i = result.length - 1
        result[i].sum = result[i].sum + extra

        for (const dataset of result) {
            dataset.sumDay = (dataset.sum / interval.nDay).toFixed(0)
            dataset.sumWeek = (dataset.sum / interval.nWeek).toFixed(0)
            dataset.sumMonth = (dataset.sum / interval.nMonth).toFixed(0)
            dataset.sumTotal = dataset.sum.toFixed(0)
            dataset.sumYear = ((dataset.sum / interval.nMonth) * 12).toFixed(0)
        }
        return result
    }

    return (
        <div>
            <div className="d-inline">
                <button
                    className="btn btn-outline-primary"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#summaryOffCanvas"
                    aria-controls="summaryOffCanvas"
                >
                    Summary
                </button>
            </div>

            <div
                className="offcanvas offcanvas-start"
                // tabindex="-1"
                id="summaryOffCanvas"
                aria-labelledby="summaryOffCanvasLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="summaryOffCanvasLabel">
                        Summary
                    </h5>
                    <div className="px-2"></div>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <p>
                        Day = {interval.nDay.toFixed(0)}
                        &nbsp; Week = {interval.nWeek.toFixed(1)}
                        &nbsp; Month = {interval.nMonth.toFixed(1)}
                    </p>
                    <div className="d-flex flex-row gap-2 align-items-center">
                        <label htmlFor="offsetDay">Skip Days =</label>
                        <input
                            className="form-control"
                            id="offsetDay"
                            value={offsetDay}
                            onChange={(e) => changeOffset(e.target.value)}
                            style={{ width: '4.5em' }}
                            type="number"
                            required
                        />
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th className="text-end">Total</th>
                                <th className="text-end">Day</th>
                                <th className="text-end">Week</th>
                                <th className="text-end">Month</th>
                                <th className="text-end">Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {_.map(summaries, (summary) => (
                                <tr key={summary.key}>
                                    <td>{summary.key}</td>
                                    <td className="text-end">
                                        {summary.sumTotal}
                                    </td>
                                    <td className="text-end">
                                        {summary.sumDay}
                                    </td>
                                    <td className="text-end">
                                        {summary.sumWeek}
                                    </td>
                                    <td className="text-end">
                                        {summary.sumMonth}
                                    </td>
                                    <td className="text-end">
                                        {summary.sumYear}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
