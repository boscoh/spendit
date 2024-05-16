<script>
    import _ from 'lodash'
    import {DateTime, Interval} from 'luxon'
    import {categories, offset, rows, updateOffsetDays} from "../../../store.js";

    let offsetDay = 0
    $: interval = getInterval($rows, offsetDay)
    $: summaries = getSummaries($rows, $categories, interval)
    $: offsetDay = $offset

    function onOffsetChange(e) {
        updateOffsetDays(e.target.value)
    }

    function getInterval(rows, offsetDay) {
        if (!rows.length) {
            return {}
        }
        let times = _.map(rows, (r) => DateTime.fromISO(r[1]))
        times.sort((a, b) => b - a)
        let interval = Interval.fromDateTimes(_.last(times), _.head(times))
        const nDay = interval.length('days') - offsetDay
        const nWeek = (nDay / 7).toFixed(2)
        const nMonth = (nDay / 30).toFixed(2)
        return {nDay, nWeek, nMonth}
    }

    function getSummaries(rows, categories, interval) {
        if (!rows.length || !categories.length) {
            return []
        }
        let result = []
        for (let c of categories) {
            let dataset = {
                sum: 0,
                key: c.key,
                desc: c.key + ': ' + c.desc
            }
            for (let row of rows) {
                if (row[4] === c.key) {
                    dataset.sum = dataset.sum + row[3]
                }
            }
            result.push(dataset)
        }

        let extra = 0
        for (let row of rows) {
            if (!row[4]) {
                extra += row[3]
            }
        }
        let i = result.length - 1
        result[i].sum = result[i].sum + extra

        for (let dataset of result) {
            dataset.sumDay = (dataset.sum / interval.nDay).toFixed(0)
            dataset.sumWeek = (dataset.sum / interval.nWeek).toFixed(0)
            dataset.sumMonth = (dataset.sum / interval.nMonth).toFixed(0)
            dataset.sum = dataset.sum.toFixed(0)
            dataset.sumYear = dataset.sumMonth * 12
        }
        return result
    }

</script>

<div class="d-inline">
    <button
            aria-controls="summaryOffCanvas"
            class="btn btn-outline-primary"
            data-bs-target="#summaryOffCanvas"
            data-bs-toggle="offcanvas"
            type="button"
    >
        Summary
    </button>
</div>

<div
        aria-labelledby="summaryOffCanvasLabel"
        class="offcanvas offcanvas-start"
        id="summaryOffCanvas"
        tabindex="-1"
>
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="summaryOffCanvasLabel">Summary</h5>
        <div class="px-2"></div>
        <button
                aria-label="Close"
                class="btn-close"
                data-bs-dismiss="offcanvas"
                type="button"
        ></button>
    </div>
    <div class="offcanvas-body">
        <p>
            Day = {interval.nDay} &nbsp; Week = {interval.nWeek} &nbsp; Month = {interval.nMonth}
        </p>
        <div class="d-flex flex-row gap-2 align-items-center">
            <label for="offsetDay">Skip Days =</label>
            <input
                    bind:value={offsetDay}
                    class="form-control"
                    id="offsetDay"
                    required
                    style="width: 4.5em"
                    type="number"
                    on:change={onOffsetChange}
            />
        </div>
        <table class="table">
            <thead>
            <tr>
                <th>#</th>
                <th class="text-end">Total</th>
                <th class="text-end">Day</th>
                <th class="text-end">Week</th>
                <th class="text-end">Month</th>
                <th class="text-end">Year</th>
            </tr>
            </thead>
            <tbody>
            {#each summaries as summary}
                <tr>
                    <td>{summary.key}</td>
                    <td class="text-end">{summary.sum}</td>
                    <td class="text-end">{summary.sumDay}</td>
                    <td class="text-end">{summary.sumWeek}</td>
                    <td class="text-end">{summary.sumMonth}</td>
                    <td class="text-end">{summary.sumYear}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>