<script lang="ts">
  import type { SubTotalType } from "../../../_stores/calculator/types";
  import type { IProjectedCashFlowData } from "../../../_stores/calculator/types";

  export let projection: IProjectedCashFlowData;
  export let subTotalGroup: string;
  export let label: string;
  export let dates: Array<{ i: number } & any>;
  export let isExpectedToBePositive: boolean = true;
  export let isBeginning: boolean = false;

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

  const isNonValue = (i: number) => {
    return projection[subTotalGroup][i].amount == 0;
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

<tr class:isBeginning>
  <th class="isIndented isSticky">{label}</th>
  {#each dates as date (date.i)}
    <td
      class="gdb-cf-currency"
      class:isNegativeShaded={isNegativeShaded(date.i)}
      class:isNegativeValue={isExpectedToBePositive && projection[subTotalGroup][date.i].amount < 0}
      class:isNonValue={isNonValue(date.i)}>{formatUSD(projection[subTotalGroup][date.i].amount)}</td>
  {/each}
</tr>
