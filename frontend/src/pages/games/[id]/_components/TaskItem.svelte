<script lang="ts">
  import Icon from "../../../../components/buttons/Icon.svelte";
  import { PredefinedIcons } from "../../../../components/buttons/PredefinedIcons";

  export let module: string;
  export let task: string;
</script>

<style lang="scss">
  @import "../../../../styles/_variables.scss";

  li {
    line-height: $line-height-base;
  }

  .gdb-task {
    display: flex;
    border: 1px solid $cs-grey-0;
    border-radius: 4px;
    padding: $space-xs;
  }

  .gdb-task-icon {
    display: inline-block;
    width: 1rem;
    margin: 0 $space-xs;
    text-align: center;
    color: $cs-green-1;
  }
  .gdb-task-module {
    display: inline-block;
    font-size: $font-size-smallest;
    color: $cs-grey-3;
    text-align: right;
  }
  .gdb-task-text {
    flex: 1;
  }
</style>

<li>
  <div class="gdb-task">
    <span class="gdb-task-icon"> <Icon icon={PredefinedIcons.GraphicAdd} /></span>
    <span class="gdb-task-text">{task}</span>
    <span class="gdb-task-module">{module}</span>
  </div>
</li>
