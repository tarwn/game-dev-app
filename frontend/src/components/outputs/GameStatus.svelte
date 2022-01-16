<script lang="ts">
  import { GameStatus } from "../../pages/_stores/types";
  export let status: GameStatus;
</script>

<style lang="scss">
  @import "../../styles/_variables.scss";
</style>

<span class="gdb-gameStatus-text">{GameStatus[status]}</span>
