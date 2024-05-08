import { useDispatch, useSelector } from 'react-redux'
import _ from 'lodash'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js'
import { IRootState } from '../store'
import { ITransactions, set } from '../store/transactionsSlice.tsx' // function getNext<T>(x: T, xVals: T[]) {

export default function CategoryPlot() {
    const dispatch = useDispatch()
    const transactions: ITransactions = useSelector(
        (state: IRootState) => state.transactions
    )

    let categories = transactions.categories
    if (transactions.filterCategory) {
        categories = _.filter(
            categories,
            (c) => c.key === transactions.filterCategory
        )
    }

    const data: Plotly.Data[] = []
    for (const category of categories) {
        if (category.key === 'X') {
            continue
        }
        let cumul = 0
        const x: Plotly.Datum[] = []
        const y: Plotly.Datum[] = []
        for (const row of transactions.rows) {
            if (row[4] === category.key) {
                x.push(row[1])
                if (typeof row[3] === 'number') {
                    cumul = cumul + row[3]
                }
                y.push(cumul)
            }
        }
        data.push({
            x,
            y,
            name: category.key + ' - ' + category.desc,
            type: 'scatter',
        })
    }

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

    function onClick(data: Plotly.PlotMouseEvent) {
        const point = data.points[0]
        if (point.x) {
            const time = point.x.toString()
            const category = point.data.name.split(' ')[0]
            dispatch(set({ clickTransaction: { time, category } }))
        }
    }

    return (
        <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            onClick={onClick}
            style={{ width: '100%', height: '100%' }}
        />
    )
}
