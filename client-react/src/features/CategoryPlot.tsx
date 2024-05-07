import { useSelector } from 'react-redux'
import _ from 'lodash'
import { useRef, useState } from 'react'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js'
import { IRootState } from '../store'
import {useDispatch} from "react-redux";
import { ITransactions, set, setClickTransaction } from '../store/transactionsSlice.tsx' // function getNext<T>(x: T, xVals: T[]) {

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function CategoryPlot() {
    const dispatch = useDispatch()
    const transactions: ITransactions = useSelector(
        (state: IRootState) => state.transactions
    )
    const plotlyRef = useRef(null)
    const descByCategory = _.mapValues(
        _.keyBy(transactions.categories, 'key'),
        'desc'
    )
    const [hasListener, setHasListener]  = useState(false)

    let categories = transactions.categories
    if (transactions.filterCategory) {
        categories = _.filter(
            categories,
            (c) => c.key === transactions.filterCategory
        )
    }

    const plotData: Plotly.Data[] = []
    for (const category of categories) {
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

    async function addClick() {
        if (hasListener) {
            return
        }
        setHasListener(true)
        // wait for plotly to ingest data
        await sleep(100)
        if (plotlyRef.current) {
            console.log('plotly ref', plotlyRef.current.el)
            if (plotlyRef.current) {
                plotlyRef.current.el.on('plotly_click', (data) => {
                    const point = data.points[0]
                    const payload = {time: point.x, category: point.data.name.split(' ')[0]}
                    console.log('click', payload)
                    dispatch(set({clickTransaction: payload}))
                })
            }
        }
    }

    addClick()

    return (
        <Plot
            ref={plotlyRef}
            data={plotData}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
        />
    )
}
