<script lang="ts">
  import ContactMe from "./ContactMe.svelte";

  export let subject: string;

  $: message = `The ${subject} is coming soon, but is still under development.`;
</script>

<style lang="scss">
  @import "../styles/_variables.scss";

  .gdb-coming-soon {
    position: relative;
    min-height: 10rem;
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

    & > h2 {
      margin-top: 0;
      padding-top: 0;
    }
  }

  .gdb-coming-soon-content {
    position: relative;
    filter: blur(2px);
    opacity: 0.9;
  }

  .gdb-coming-soon-message,
  .gdb-coming-soon-contact {
    margin: $space-s 0;
  }
</style>

<div class="gdb-coming-soon">
  <div class="gdb-message-container">
    <div class="gdb-message-box">
      <h2>Coming Soon</h2>
      <div class="gdb-coming-soon-message">🚧 {message}</div>
      <div class="gdb-coming-soon-contact">
        If you'd like a preview or need this to finish out a pitch or similar, please <ContactMe />.
      </div>
    </div>
  </div>
  <div class="gdb-coming-soon-content">
    <div class="gdb-blur-overlay" />
    <slot />
  </div>
</div>
