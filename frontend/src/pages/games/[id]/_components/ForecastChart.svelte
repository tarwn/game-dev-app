<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { curveCardinal, scaleLinear, scaleTime, extent } from "d3";

  let el: any;

  var data = [
    { date: new Date("Jan 1, 2020"), value: 15000 },
    { date: new Date("Feb 1, 2020"), value: 14000 },
    { date: new Date("Mar 1, 2020"), value: 12000 },
    { date: new Date("Apr 1, 2020"), value: 10000 },
    { date: new Date("May 1, 2020"), value: 8000 },
    { date: new Date("Jun 1, 2020"), value: 26000 },
    { date: new Date("Jul 1, 2020"), value: 24000 },
    { date: new Date("Aug 1, 2020"), value: 21000 },
    { date: new Date("Sep 1, 2020"), value: 15000 },
    { date: new Date("Oct 1, 2020"), value: 10000 },
    { date: new Date("Nov 1, 2020"), value: -2000 },
    { date: new Date("Dec 1, 2020"), value: -3000 },
    { date: new Date("Jan 1, 2021"), value: 8000 },
    { date: new Date("Feb 1, 2021"), value: 5000 },
    { date: new Date("Mar 1, 2021"), value: 4000 },
  ];

  var width = 400;
  var height = 150;
  var margin = { top: 5, bottom: 20, left: 30, right: 10 };

  // scales
  const extentX = extent(data, (d: any) => d.date);
  const xScale = scaleTime()
    .domain(extentX)
    .range([margin.left, width - margin.right]);

  //const extentY = extent(data, (d: any) => d.value);
  const yScale = scaleLinear()
    .domain([-5000, 40000])
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
    yAxisDrawn.style("color", "#c3cecd").attr("transform", "translate(" + [margin.left, 0] + ")");
    yAxisDrawn.select(".domain").remove();
    yAxisDrawn.selectAll("line").remove();

    const xAxisDrawn = svg
      .append("g")
      .style("color", "#c3cecd")
      .attr("transform", "translate(" + [0, height - margin.bottom] + ")")
      .call(
        d3
          .axisBottom(xScale)
          .ticks(4)
          .tickFormat((d: any) => d.toLocaleDateString("en-US", { month: "short" }))
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
      .attr("d", area as any)
      .attr("clip-path", "url(#positive-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "#e5adac")
      .attr("d", area as any)
      .attr("clip-path", "url(#negative-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#9ac43b")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line as any)
      .attr("clip-path", "url(#positive-clip");

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#c2403d")
      .attr("stroke-width", 2.0)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line as any)
      .attr("clip-path", "url(#negative-clip");
  });
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  .chart-thing {
    padding: $space-m;
    margin: $space-xs;

    & > h3 {
      text-align: center;
      font-size: 90%;
      display: block;
      margin: $space-xs 0 $space-s 0;
    }
  }

  .chart-thing > svg {
    margin: 0px;
    width: 100%;
  }
</style>

<div class="chart-thing">
  <h3>Financial Forecast</h3>
  <svg bind:this={el} viewBox="0 0 400 150" />
</div>
