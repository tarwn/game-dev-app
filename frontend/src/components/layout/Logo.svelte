<script lang="ts">
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";

  .gdb-logo {
    margin: 1rem 1rem 1rem 0.75rem;
    line-height: 32px;
    text-align: center;
    white-space: nowrap;
    opacity: 0.75;
  }

  .gdb-logo-img {
    width: 32px;
    height: 32px;
    vertical-align: middle;
    margin-top: -4px;
  }

  .gdb-logo-launch,
  .gdb-logo-ready {
    display: inline-block;
    line-height: 28px;
    height: 28px;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    font-size: 18px;
  }

  .gdb-logo-launch {
    display: inline-block;
    border-left: 2px solid $color-accent-1;
    margin: 2px 0 1px 0.25rem;
    padding-left: 0.5rem;
    color: $color-accent-1;
  }

  .gdb-logo-ready {
    margin-left: -2px;
    color: $cs_darkgrey;
  }
</style>

<div class="gdb-logo">
  <img class="gdb-logo-img" src="/favicon-32x32.png" alt="LR Logo" />
  <div class="gdb-logo-launch">Launch</div>
  <div class="gdb-logo-ready">Ready</div>
</div>
