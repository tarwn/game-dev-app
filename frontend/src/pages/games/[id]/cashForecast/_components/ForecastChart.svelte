<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { curveCardinal, scaleLinear, scaleTime, extent } from "d3";
  import type { ICashForecast } from "../_types/cashForecast";
  import type { IProjectedCashFlowData } from "../_stores/calculator/types";
  import { getUtcDate } from "../../../../../utilities/date";

  export let cashForecast: ICashForecast;
  export let projectedCashForecast: IProjectedCashFlowData;
  export let width: number = 400;
  export let height: number = 180;

  let el: any;
  let lineCharts = [];
  let areaCharts = [];

  let data = [
    {
      date: getUtcDate(2020, 0, 1),
      value: 0,
    },
    {
      date: getUtcDate(2022, 0, 1),
      value: 0,
    },
  ];
  let minAmount = 0;
  let maxAmount = 50000;
  let yTicks = [0, 10000, 20000, 30000, 40000, 50000];
  let xTicks = [getUtcDate(2020, 1, 1), getUtcDate(2021, 1, 1), getUtcDate(2022, 1, 1)];

  const margin = { top: 5, bottom: 20, left: 40, right: 10 };

  // scales
  const extentX = extent(data, (d: any) => d.date);
  const xScale = scaleTime()
    .domain(extentX)
    .range([margin.left, width - margin.right]);

  //const extentY = extent(data, (d: any) => d.value);
  const yScale = scaleLinear()
    .domain([minAmount, maxAmount])
    .range([height - margin.bottom, margin.top]);

  // path function for line + area
  const line = d3
    .line()
    .curve(curveCardinal)
    .x((d: any) => xScale(d.date))
    .y((d: any) => yScale(d.value));

  const area = d3
    .area()
    .x((d: any) => xScale(d.date))
    .y0(() => yScale(0))
    .y1((d: any) => yScale(d.value))
    .curve(curveCardinal);

  // clip areas
  let originPositionY = yScale(0);

  //const xAxis = () => d3.axisBottom(xScale).ticks(4);
  //.tickSizeOuter(0);

  // const yAxis = d3
  //   .axisLeft(yScale)
  //   .ticks(6)
  //   .tickFormat(function (d: any) {
  //     return d / 1000 + "k";
  //   });

  // const xAxis = d3
  //   .axisBottom(xScale)
  //   .ticks(4)
  //   .tickFormat((d: any) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }));

  $: {
    if (cashForecast && projectedCashForecast && el) {
      // resize data if necessary
      if (!data || data.length != cashForecast.forecastMonthCount.value) {
        data = Array.from(new Array(cashForecast.forecastMonthCount.value).keys()).map((i) => ({
          date: getUtcDate(
            cashForecast.forecastStartDate.value.getUTCFullYear(),
            cashForecast.forecastStartDate.value.getUTCMonth() + i,
            1
          ),
          value: 0,
        }));
      }

      // apply real values to data
      minAmount = 0;
      maxAmount = 10000;
      for (let i = 0; i < cashForecast.forecastMonthCount.value; i++) {
        data[i].value = projectedCashForecast.EndingCash[i].amount;
        if (minAmount > data[i].value) {
          minAmount = data[i].value;
        }
        if (maxAmount < data[i].value) {
          maxAmount = data[i].value;
        }
      }

      // update x min/max
      extentX[0] = getUtcDate(
        cashForecast.forecastStartDate.value.getUTCFullYear(),
        cashForecast.forecastStartDate.value.getUTCMonth(),
        1
      );
      extentX[1] = getUtcDate(
        cashForecast.forecastStartDate.value.getUTCFullYear(),
        cashForecast.forecastStartDate.value.getUTCMonth() + cashForecast.forecastMonthCount.value - 1,
        1
      );
      xScale.domain(extentX);
      xTicks = xScale.ticks(5);

      // update y min/max
      const minY = Math.floor(minAmount / 10000) * 10000;
      const maxY = Math.ceil(maxAmount / 10000) * 10000;
      yScale.domain([minY, maxY]);
      yTicks = yScale.ticks(10);
      originPositionY = yScale(0);

      if (el) {
        lineCharts.forEach((c) => c.data([data]).attr("d", line as any));
        areaCharts.forEach((c) => c.data([data]).attr("d", area as any));
      }
    }
  }

  onMount(() => {
    const svg = d3.select(el);

    areaCharts = [
      svg
        .append("path")
        .data([data])
        .attr("fill", "#d4e6ab")
        .attr("d", area as any)
        .attr("clip-path", "url(#positive-clip)"),
      svg
        .append("path")
        .data([data])
        .attr("fill", "#e5adac")
        .attr("d", area as any)
        .attr("clip-path", "url(#negative-clip)"),
    ];
    lineCharts = [
      svg
        .append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "#9ac43b")
        .attr("stroke-width", 2.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line as any)
        .attr("clip-path", "url(#positive-clip)"),
      svg
        .append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "#c2403d")
        .attr("stroke-width", 2.0)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line as any)
        .attr("clip-path", "url(#negative-clip)"),
    ];
  });
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";

  svg {
    margin: 0px;
    width: 100%;
  }
  .gdb-chart-grid-line {
    stroke: $cs-grey-0;
  }
  .gdb-chart-axis-label {
    font-size: 12px;
    text-anchor: end;
    fill: $cs-grey-2;

    &.horizantal {
      text-anchor: middle;
    }
  }
  .gdb-chart-grid-axis {
    stroke: $cs-grey-1;
  }
</style>

<svg bind:this={el} viewBox={`0 0 ${width} ${height}`}>
  <defs>
    <clipPath id="positive-clip"><rect x={margin.left} y={0} height={originPositionY} {width} /></clipPath>
    <clipPath id="negative-clip"><rect x={margin.left} y={originPositionY} {height} {width} /></clipPath>
  </defs>
  <g class="y axis">
    {#each yTicks as tick}
      <text class="gdb-chart-axis-label" x={margin.left - 9} y={yScale(tick)} dy=".32em"
        >{Math.round(tick / 1000)}k</text>
      <line
        class="gdb-chart-grid-line"
        x1={margin.left}
        x2={width - margin.right}
        y1={yScale(tick)}
        y2={yScale(tick)} />
    {/each}
    <line
      class="gdb-chart-grid-axis"
      x1={margin.left - 1}
      x2={margin.left - 1}
      y1={margin.top}
      y2={height - margin.bottom} />
  </g>
  <g class="x axis">
    <line
      class="gdb-chart-grid-axis"
      x1={margin.left}
      x2={width - margin.right}
      y1={height - margin.bottom + 1}
      y2={height - margin.bottom + 1} />
    {#each xTicks as tick}
      <text class="gdb-chart-axis-label horizantal" x={xScale(tick)} y={height - margin.bottom + 8} dy="0.75em"
        >{tick.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })}</text>
      <line
        class="gdb-chart-grid-axis"
        x1={xScale(tick)}
        x2={xScale(tick)}
        y1={height - margin.bottom}
        y2={height - margin.bottom + 5} />
    {/each}
  </g>
</svg>
