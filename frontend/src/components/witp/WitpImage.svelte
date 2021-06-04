<script lang="ts">
  export let src: string;
  export let alt: string;
  export let caption: string | undefined;
</script>

<style type="text/scss">
  @import "../../styles/_variables.scss";

  img {
    display: inline-block;
    color: $cs-grey-2;
    opacity: 0.9;
    margin: auto;
    max-width: 600px;
  }

  .gdb-witp-image-container {
    margin-top: 1.5rem;
    padding-left: 4rem;
    text-align: center;
    color: $text-color-lightest;
    font-size: $font-size-small;
  }
</style>

<div class="gdb-witp-image-container">
  <img {src} {alt} />
  {#if caption}<div>{caption}</div>{/if}
</div>
