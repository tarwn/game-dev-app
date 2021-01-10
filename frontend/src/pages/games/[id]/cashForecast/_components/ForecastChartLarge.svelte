<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { curveCardinal, scaleLinear, scaleTime, extent } from "d3";
  import { sampleData } from "../_sampleData";

  let el: any;

  const data = sampleData.map((d) => ({
    date: d.month,
    value: d.endingCash,
  }));
  const minAmount =
    -10000 * Math.ceil(Math.min(-10000, ...data.map((d) => d.value)) / -10000);
  const maxAmount =
    10000 * Math.ceil(Math.max(40000, ...data.map((d) => d.value)) / 10000);

  const width = 1280;
  const height = 300;
  const margin = { top: 5, bottom: 20, left: 30, right: 10 };

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
    .y0(yScale(0))
    .y1((d: any) => yScale(d.value))
    .curve(curveCardinal);

  //const xAxis = () => d3.axisBottom(xScale).ticks(4);
  //.tickSizeOuter(0);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(6)
    .tickFormat(function (d: any) {
      return d / 1000 + "k";
    });

  onMount(() => {
    const svg = d3.select(el);

    const yAxisDrawn = svg.append("g").call(yAxis);
    yAxisDrawn
      .style("color", "#c3cecd")
      .attr("transform", "translate(" + [margin.left, 0] + ")");
    yAxisDrawn.select(".domain").remove();
    yAxisDrawn.selectAll("line").remove();

    const yAxisGrid = svg
      .append("g")
      .call(yAxis.tickSize(-width, 0, 0).tickFormat(""));
    yAxisGrid
      .attr("transform", "translate(" + [margin.left, 0] + ")")
      .attr("class", "grid");
    yAxisGrid.select(".domain").remove();
    yAxisGrid.selectAll("text").remove();
    yAxisGrid.selectAll("line").attr("class", "gdb-chart-grid-line");

    const xAxisDrawn = svg
      .append("g")
      .style("color", "#c3cecd")
      .attr("transform", "translate(" + [0, height - margin.bottom] + ")")
      .call(
        d3
          .axisBottom(xScale)
          .ticks(4)
          .tickFormat((d: any) =>
            d.toLocaleDateString("en-US", { month: "short" })
          )
      );
    xAxisDrawn.select(".domain").remove();
    xAxisDrawn.selectAll("line").remove();

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", "positive-clip")
      .append("rect")
      .attr("x", xScale(data[0].date))
      .attr("y", 0)
      // these are overkill, but sufficient
      .attr("height", yScale(0))
      .attr("width", width);
    defs
      .append("clipPath")
      .attr("id", "negative-clip")
      .append("rect")
      .attr("x", xScale(data[0].date))
      .attr("y", yScale(0))
      // these are overkill, but sufficient
      .attr("height", height)
      .attr("width", width);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "#d4e6ab")
      .attr("d", area)
      .attr("clip-path", "url(#positive-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "#e5adac")
      .attr("d", area)
      .attr("clip-path", "url(#negative-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#9ac43b")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line)
      .attr("clip-path", "url(#positive-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#c2403d")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line)
      .attr("clip-path", "url(#negative-clip");
  });
</script>

<style type="text/scss">
  @import "../../../../../styles/_variables.scss";

  :global().gdb-chart-grid-line {
    stroke: $cs-grey-0;
  }
  svg {
    margin: 0px;
    width: 100%;
  }
</style>

<svg bind:this={el} viewBox="0 0 1280 300" />
