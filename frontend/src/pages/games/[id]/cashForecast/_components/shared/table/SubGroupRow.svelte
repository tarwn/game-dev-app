<script lang="ts">
  import type { IProjectedCashFlowData } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let group: string;
  export let label: string;
  export let dates: Array<{ i: number } & any>;
  export let isPositive: boolean = true;
  export let startExpanded: boolean = true;
  export let canExpand: boolean = true;

  let isToggledOpen: boolean = startExpanded;

  const isNegativeShaded = (i: number) => {
    return projection.EndingCash[i].amount < 0 || projection.BeginningCash[i].amount < 0;
  };

  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // currencySign: "accounting",
  });
  function formatUSD(val: number) {
    if (val == 0) {
      return "-";
    }
    return currencyFormat.format(val);
  }

  const isNonValue = (i: number) => {
    return projection[group][i].amount == 0;
  };
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-button-text {
    border: 0;
    background-color: transparent;
    cursor: pointer;
    padding-left: $space-s;

    &::before {
      content: "+";
      padding-right: $space-s;
      width: $space-s;
      display: inline-block;
    }

    &:hover {
      text-decoration: underline;
      color: $color-accent-1-darker;
    }
  }

  .gdb-button-text.isToggledOpen {
    &::before {
      content: "-";
    }
  }

  .gdb-cf-currency {
    text-align: right;
  }

  .isNegativeValue {
    color: $cs-red-3;
  }

  td.isNegativeShaded {
    background-color: $cs-red-0;
  }

  .isNonValue {
    color: $cs-grey-1;
    text-align: center;
  }

  // tr.isEmpty {
  //   font-size: 1px;

  //   & > td,
  //   & > th {
  //     line-height: $space-s;
  //     height: $space-s;
  //   }
  // }

  // td.isSubTotalValue {
  //   // border-top: 3px double $cs-grey-2;
  // }
</style>

<tr>
  {#if canExpand}
    <th class="isSticky isIndented isGroup hasToggle">
      <button class="gdb-button-text" class:isToggledOpen on:click={() => (isToggledOpen = !isToggledOpen)}
        >{label}</button>
    </th>
  {:else}
    <th class="isIndented isGroup isSticky">
      {label}
    </th>
  {/if}
  {#if canExpand && isToggledOpen}
    {#each dates as date}
      <td class:isNegativeShaded={isNegativeShaded(date.i)} />
    {/each}
  {:else}
    {#each dates as date (date.i)}
      <td
        class="gdb-cf-currency isSubTotalValue isIndented"
        class:isNegativeValue={isPositive && projection[group][date.i].amount < 0}
        class:isNegativeShaded={isNegativeShaded(date.i)}
        class:isPositiveShaded={!isNegativeShaded(date.i)}
        class:isNonValue={isNonValue(date.i)}>
        {formatUSD(projection[group][date.i].amount)}
      </td>
    {/each}
  {/if}
</tr>
{#if isToggledOpen}
  <slot />
  <!-- <tr class="isEmpty">
    <th class="isSticky" />
    {#each dates as date}
      <td class:isNegativeShaded={isNegativeShaded(date.i)} />
    {/each}
  </tr> -->
{/if}
