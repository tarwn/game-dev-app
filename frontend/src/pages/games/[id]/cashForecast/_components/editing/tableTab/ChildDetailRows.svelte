<script lang="ts">
  import type { SubTotalType } from "../../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let group: SubTotalType;
  export let dates: Array<{ i: number } & any>;
  export let isPositive: boolean = true;
  export let isBeginning: boolean = false;
  export let suffix: string = "";
  export let level: number = 1;

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

  const isNegativeShaded = (i: number) => {
    return projection.EndingCash[i].amount < 0 || projection.BeginningCash[i].amount < 0;
  };

  const isNonValue = (globalId: string, i: number) => {
    return projection.details.get(group).get(globalId)[i].amount == 0;
  };

  const getLabel = (globalId: string) => {
    return projection.elements.get(globalId).name + " " + suffix;
  };
</script>

<style type="text/scss">
  @import "../../../../../../../styles/_variables.scss";

  .gdb-cf-currency {
    text-align: right;
  }

  .isNegativeValue {
    color: $cs-red-3;
  }

  .isNonValue {
    color: $cs-grey-1;
    text-align: center;
  }

  td.isNegativeShaded {
    background-color: $cs-red-0;
  }

  tr.isBeginning {
    background-color: $cs-grey-0;

    & > td.isNegativeShaded {
      background-color: darken($cs-red-0, 5%);
    }
  }

  // sticky columns bg causes issues, override them
  tr.isBeginning > th {
    background-color: $cs-grey-0;
  }
</style>

{#each Array.from(projection.details.get(group).keys()) as entry (entry)}
  <tr class:isBeginning>
    <th class="isSticky" class:isIndented={level === 1} class:isDoubleIndented={level === 2}>{getLabel(entry)}</th>
    {#each dates as date (date.i)}
      <td
        class="gdb-cf-currency"
        class:isNegativeShaded={isNegativeShaded(date.i)}
        class:isNegativeValue={isPositive && projection.details.get(group).get(entry)[date.i].amount < 0}
        class:isNonValue={isNonValue(entry, date.i)}
        >{formatUSD(projection.details.get(group).get(entry)[date.i].amount)}</td>
    {/each}
  </tr>
{/each}
