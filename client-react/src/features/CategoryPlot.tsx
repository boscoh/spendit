import {useSelector} from 'react-redux'
import _ from 'lodash'
import Plot from 'react-plotly.js'
import Plotly from "plotly.js"
import {IRootState} from "../store/store.ts";
import {ITransactions} from "../store/transactionsSlice.tsx" // function getNext<T>(x: T, xVals: T[]) {

// function getNext<T>(x: T, xVals: T[]) {
//     const i = xVals.indexOf(x)
//     const iNext = i < xVals.length - 1 ? i + 1 : 0
//     return xVals[iNext]
// }

export function CategoryPlot() {
    const transactions: ITransactions = useSelector(
        (state: IRootState) => state.transactions
    )
    const descByCategory = _.mapValues(
        _.keyBy(transactions.categories, 'key'),
        'desc'
    )

    const plotData: Plotly.Data[] = []
    for (const category of transactions.categories) {
        if (category.key === 'X') {
            continue
        }
        const x: Plotly.Datum[] = []
        const y: Plotly.Datum[] = []
        const name = category.key + ' - ' + descByCategory[category.key]

        const dataset: Plotly.Data = { x, y, name, type: 'scatter' }

        let cumul = 0
        for (const row of transactions.rows) {
            if (row[4] === category.key) {
                x.push(row[1])
                if (typeof row[3] === 'number') {
                    cumul = cumul + row[3]
                }
                y.push(cumul)
            }
        }
        plotData.push(dataset)
    }

    // remove space for title
    const layout: Partial<Plotly.Layout> = {
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4,
        },
        hovermode: 'closest',
    }

    return (
            <Plot
                data={plotData}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
    )
}
