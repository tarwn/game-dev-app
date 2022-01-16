<script lang="ts">
  export let hasUnsaved: boolean;
  export let lastSaved: Date;

  let message = "all changes saved";
  let timeout = null;
  $: {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (hasUnsaved) {
      message = "saving changes...";
    } else if (new Date().getTime() - lastSaved.getTime() > 300) {
      message = "all changes saved";
    } else {
      timeout = setTimeout(() => {
        message = "all changes saved";
      }, 250);
    }
  }
</script>

<style lang="scss">
  @import "../styles/_variables.scss";

  .gdb-save-label {
    display: inline-block;
    color: $text-color-light;
    font-size: $font-size-smallest;
    font-style: italic;
    position: relative;
  }
</style>

<span class="gdb-save-label">{message}</span>
