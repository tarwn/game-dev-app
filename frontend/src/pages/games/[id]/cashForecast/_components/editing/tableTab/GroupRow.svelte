<script lang="ts">
  import type { IProjectedCashFlowData } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let group: string;
  export let label: string;
  export let dates: Array<{ i: number } & any>;
  export let isPositive: boolean = true;
  export let isBeginning: boolean = false;
  export let isTotal: boolean = false;
  export let canExpand: boolean = true;
  export let startExpanded: boolean = true;

  let isToggledOpen: boolean = canExpand && startExpanded;

  const isNegativeShaded = (i: number) => {
    return projection.EndingCash[i].amount < 0 || projection.BeginningCash[i].amount < 0;
  };

  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // currencySign: "accounting",
  });
  function formatUSD(val: number) {
    return currencyFormat.format(val);
  }
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .isStillBold {
    font-weight: bold;
  }

  .gdb-button-text {
    font-weight: bold;
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

  tr.isBeginning {
    background-color: $cs-grey-0;
    & > td.isNegativeShaded {
      background-color: darken($cs-red-0, 5%);
    }

    & + tr.isEmpty {
      border-top: 1px solid $cs-grey-2;
    }
  }

  tr.isTotal {
    border-top: 3px double $cs-grey-2;
    background-color: $cs-grey-0;
    font-weight: bold;

    & > td {
      background-color: $cs-grey-1;
      &.isPositiveShaded {
        background-color: $cs-green-1;
      }
      &.isNegativeShaded {
        background-color: $cs-red-1;
      }
    }
  }

  // sticky columns bg causes issues, override them
  tr.isBeginning > th,
  tr.isTotal > th {
    background-color: $cs-grey-0;
  }

  tr.isBeginning.isAlsoFirst > th {
    // fix disappearing borders - isAlsoFirst to enforce this only be applied to the very first beginning row
    &:before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -2px;
      bottom: 0;
      border-right: 1px solid $cs-grey-0;
      // cover the extra unclipped border
      border-top: 2px solid white;
      z-index: -1;
    }
  }

  tr.isEmpty {
    font-size: 1px;

    & > td,
    & > th {
      line-height: $space-s;
      height: $space-s;
    }
  }

  td.isSubTotalValue {
    // border-top: 3px double $cs-grey-2;
    font-weight: bold;
  }
</style>

<tr class:isBeginning class:isTotal class:isAlsoFirst={isBeginning}>
  {#if canExpand}
    <th class="isSticky hasToggle">
      <button class="gdb-button-text" class:isToggledOpen on:click={() => (isToggledOpen = !isToggledOpen)}
        >{label}</button>
    </th>
  {:else}
    <th class="isStillBold isSticky">
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
        class="gdb-cf-currency isSubTotalValue"
        class:isNegativeValue={!isTotal && isPositive && projection[group][date.i].amount < 0}
        class:isNegativeShaded={isNegativeShaded(date.i)}
        class:isPositiveShaded={isTotal && !isNegativeShaded(date.i)}>
        {formatUSD(projection[group][date.i].amount)}
      </td>
    {/each}
  {/if}
</tr>
{#if canExpand && isToggledOpen}
  <slot />
  <tr class:isBeginning>
    <th class="isSticky isSubTotalValue">
      Total {label}
    </th>
    {#each dates as date (date.i)}
      <td
        class="gdb-cf-currency isSubTotalValue"
        class:isNegativeShaded={isNegativeShaded(date.i)}
        class:isNegativeValue={!isTotal && isPositive && projection[group][date.i].amount < 0}>
        {formatUSD(projection[group][date.i].amount)}
      </td>
    {/each}
  </tr>
{/if}
{#if !isTotal && canExpand && isToggledOpen}
  <tr class="isEmpty">
    <th class="isSticky" />
    {#each dates as date}
      <td class:isNegativeShaded={isNegativeShaded(date.i)} />
    {/each}
  </tr>
{/if}
