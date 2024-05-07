<script>
    import {categories, clickTransaction, filterCategory, rows} from "../../../store.js"
    import _ from 'lodash'
    import Plot from 'svelte-plotly.js';

    $: data = buildData($rows, $categories, $filterCategory)


    function onPlotlyClick(e) {
        const point = e.detail.points[0]
        const payload = {time: point.x, category: point.data.name.split(' ')[0]}
        clickTransaction.set(payload)
    }


    function buildData(rows, categories, filterCategory) {
        if (filterCategory) {
            categories = _.filter(categories, (c) => c.key === filterCategory)
        }

        let newPlotData = []
        for (let category of categories) {
            if (category.key === 'X') {
                continue
            }
            let dataset = {
                x: [],
                y: [],
                type: 'scatter',
                name: category.key + ' - ' + category.desc
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
        on:click={onPlotlyClick}
        layout={layout}
        fillParent="width"
/>

