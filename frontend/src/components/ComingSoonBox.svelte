<script lang="ts">
</script>

<style type="text/scss">
  @import "../styles/_variables.scss";

  .gdb-coming-soon {
    position: relative;
    min-height: 10rem;
    opacity: 0.9;
  }

  .gdb-message-container {
    position: absolute;
    top: 2rem;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 5;
  }

  .gdb-message-box {
    display: inline-block;
    margin: 0 auto;
    background-color: $cs-blue-0;
    border: 2px solid $cs-blue-2;
    padding: $space-s;
    border-radius: 0.5rem;

    & > h3 {
      margin-top: 0;
      padding-top: 0;
    }
  }

  .gdb-coming-soon-contact {
    margin: $space-s 0;
  }
</style>

<div class="gdb-coming-soon">
  <div class="gdb-message-container">
    <div class="gdb-message-box">
      <h3>🚧 Coming Soon</h3>
      <div class="gdb-coming-soon-contact">
        <slot />
      </div>
    </div>
  </div>
</div>
