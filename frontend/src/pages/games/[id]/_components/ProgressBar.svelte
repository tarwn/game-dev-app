<script lang="ts">
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  .chart-thing {
    width: 160px;
    padding: $space-m;
    margin: $space-xs;
    border-right: 1px solid #eee;

    & > h3 {
      text-align: center;
      font-size: 90%;
      display: block;
      margin: $space-xs 0 1.5rem 0;
    }
  }

  .chart-thing > svg {
    margin: 0 20px;
    height: 100px;
    width: 120px;
  }

  .background {
    fill: $cs-grey-1;
  }

  .foreground {
    fill: $cs_green;
  }

  .legend {
    margin: 0 8px 0 10px;
  }
  .legend-0,
  .legend-1,
  .legend-2,
  .legend-3 {
    font-size: 80%;
    width: 30px;
    max-width: 29px;
    text-align: center;
    display: inline-block;
    margin-right: 3px;
    color: $cs-grey-1;
  }
</style>

<div class="chart-thing">
  <h3>Planning Status</h3>
  <svg>
    <g class="bars">
      <rect x="0" y="0" class="background" width="8px" height="100px" />
      <rect x="0" y="10" class="foreground" width="8px" height="90px" />
      <rect x="36" y="0" class="background" width="8px" height="100px" />
      <rect x="36" y="25" class="foreground" width="8px" height="75px" />
      <rect x="74" y="0" class="background" width="8px" height="100px" />
      <rect x="74" y="75" class="foreground" width="8px" height="25px" />
      <rect x="112" y="0" class="background" width="8px" height="100px" />
      <rect x="112" y="85" class="foreground" width="8px" height="15px" />
    </g>
  </svg>
  <div class="legend">
    <span class="legend-0">B.M.</span>
    <span class="legend-1">Comp.</span>
    <span class="legend-2">$$</span>
    <span class="legend-3">Mktg</span>
  </div>
</div>
