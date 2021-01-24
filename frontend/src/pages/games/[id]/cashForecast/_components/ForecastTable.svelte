<script lang="ts">
  import { sampleData } from "../_sampleData";

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
  @import "../../../../../styles/_variables.scss";

  .isNegativeValue {
    color: $cs-red-3;
  }

  td.isNegative {
    background-color: $cs-red-0;
  }

  .gdb-cf-currency {
    text-align: right;
  }

  .gdb-cf-summaryTable {
    border-collapse: collapse;
    min-width: 100%;
  }
  .gdb-cf-headRow > th,
  .gdb-cf-line-title,
  .gdb-cf-line-value {
    padding: $space-s $space-s;
  }

  td.gdb-cf-line-space {
    height: 4px;
  }

  .gdb-cf-headRow > th + th,
  .gdb-cf-line-value,
  .gdb-cf-line-space > td + td {
    border-left: 1px solid $cs-grey-0;
  }

  .gdb-cf-headRow-title > th {
    padding-top: $space-l;
    padding-bottom: $space-s;
    text-align: left;
  }

  .gdb-cf-headRow > th {
    padding-bottom: 4px;
    // background-color: $cs-grey-1;
    border-bottom: 4px solid white;
    &.isPositive {
      // background-color: $cs-green-1;
      border-bottom: 4px solid $cs-green-1;
      // background-color: white;
    }
    &.isNegative {
      background-color: $cs-red-1;
      border-bottom: 4px solid $cs-red-1;
    }
  }

  .gdb-cf-row-beginning {
    border-top: 1px solid $cs-grey-2;
    border-bottom: 1px solid $cs-grey-2;
    background-color: $cs-grey-0;
    & > td.isNegative {
      background-color: darken($cs-red-0, 5%);
    }
  }

  .gdb-cf-row-total {
    border-top: 3px double $cs-grey-2;
    background-color: $cs-grey-0;

    & > td + td {
      font-weight: bold;

      background-color: $cs-grey-1;
      &.isPositive {
        background-color: $cs-green-1;
      }
      &.isNegative {
        background-color: $cs-red-1;
      }
    }
  }

  .gdb-cf-line-title-indent {
    padding-left: $space-m;
  }

  .gdb-cf-row-balances {
    border-top: 1px solid $cs-grey-0;
    border-bottom: 1px solid $cs-grey-0;
    color: $text-color-light;
  }
</style>

<table class="gdb-cf-summaryTable">
  <thead>
    <tr class="gdb-cf-headRow">
      <th />
      {#each sampleData as month}
        <th
          class:isNegative={month.lowestCash < 0}
          class:isPositive={month.lowestCash > 0}>
          {month.month.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr class="gdb-cf-line gdb-cf-row-beginning">
      <td class="gdb-cf-line-title">Beginning Cash</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.lowestCash < 0}
          class:isNegativeValue={month.beginningCash < 0}>
          {formatUSD(month.beginningCash)}
        </td>
      {/each}
    </tr>
    <tr class="gdb-cf-line-space">
      <td class="gdb-cf-line-space" />
      {#each sampleData as month}
        <td class="gdb-cf-line-space" class:isNegative={month.lowestCash < 0} />
      {/each}
    </tr>
    {#each [0, 1, 2, 3, 4] as line}
      <tr class="gdb-cf-line">
        <td class="gdb-cf-line-title gdb-cf-line-title-indent">
          {sampleData[0].lines[line].name}
        </td>
        {#each sampleData as month}
          <td
            class="gdb-cf-currency gdb-cf-line-value"
            class:isNegative={month.lowestCash < 0}>
            {formatUSD(month.lines[line].amount)}
          </td>
        {/each}
      </tr>
      <tr class="gdb-cf-line-space">
        <td class="gdb-cf-line-space" />
        {#each sampleData as month}
          <td
            class="gdb-cf-line-space"
            class:isNegative={month.lowestCash < 0} />
        {/each}
      </tr>
    {/each}
    <tr class="gdb-cf-line gdb-cf-row-total">
      <td class="gdb-cf-line-title">Ending Cash</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.endingCash < 0}
          class:isPositive={month.endingCash > 0}>
          {formatUSD(month.endingCash)}
        </td>
      {/each}
    </tr>
  </tbody>
  <thead>
    <tr class="gdb-cf-headRow-title">
      <th>Mid-Month Balances</th>
      {#each sampleData as month}
        <th />
      {/each}
    </tr>
    <tr class="gdb-cf-headRow">
      <th />
      {#each sampleData as month}
        <th
          class:isNegative={month.lowestCash < 0}
          class:isPositive={month.lowestCash > 0}>
          {month.month.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <!-- <tr class="gdb-cf-line gdb-cf-row-lowest">
      <td class="gdb-cf-line-title">Beg. Balance</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.beginningCash < 0}>
          {formatUSD(month.beginningCash)}
        </td>
      {/each}
    </tr> -->
    <tr class="gdb-cf-line gdb-cf-row-balances">
      <td class="gdb-cf-line-title">Lowest Mid-Month</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.lowestCash < 0}>
          {formatUSD(month.lowestCash)}
        </td>
      {/each}
    </tr>
    <tr class="gdb-cf-line gdb-cf-row-balances">
      <td class="gdb-cf-line-title">Highest Mid-Month</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.highestCash < 0}>
          {formatUSD(month.highestCash)}
        </td>
      {/each}
    </tr>
    <!-- <tr class="gdb-cf-line gdb-cf-row-lowest">
      <td class="gdb-cf-line-title">End Balance</td>
      {#each sampleData as month}
        <td
          class="gdb-cf-currency gdb-cf-line-value"
          class:isNegative={month.endingCash < 0}>
          {formatUSD(month.endingCash)}
        </td>
      {/each}
    </tr> -->
  </tbody>
</table>
