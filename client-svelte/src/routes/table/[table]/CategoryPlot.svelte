<script>
    import {categories, rows} from "../../../store.js"
    import _ from 'lodash'
    import Plot from 'svelte-plotly.js';

    $: data = buildData($rows, $categories)

    function buildData(rows, categories) {
        const descByCategory = _.mapValues(_.keyBy(categories, 'key'), 'desc')
        let newPlotData = []
        console.log('categories', categories)
        for (let category of categories) {
            if (category.key === 'X') {
                continue
            }
            let dataset = {
                x: [],
                y: [],
                type: 'scatter',
                name: category.key + ' - ' + descByCategory[category.key]
            }
            let cumul = 0
            for (let row of rows) {
                if (row[4] === category.key) {
                    dataset.x.push(row[1])
                    cumul += row[3]
                    dataset.y.push(cumul)
                }
            }
            newPlotData.push(dataset)
        }
        return newPlotData
    }

    // remove space for title
    const layout = {
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 20,
            pad: 4
        },
        title: '',
        height: 300,
        hovermode: 'closest',
        clickmode: 'event'
    }
</script>

<Plot
        {data}
        layout={layout}
        fillParent="width"
/>

