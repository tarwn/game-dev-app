



interface CurrencyHelper {
  locale: string;
  currency: string;
  decimalScale: number;
  currencyParts: {
    groupSeparator: string;
    decimalSeparator: string;
    currencySymbol: string;
  };
  parseValue: (rawValue: string) => number;
  formatValue: (number: number) => string;
  allowedCharacters: Set<string>;
}

export const getCurrencyHelper = (locale: string, currency: string, decimalScale: number, minDecimalScale?: number): CurrencyHelper => {

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: minDecimalScale ?? decimalScale,
    maximumFractionDigits: decimalScale,
  });

  // https://stackoverflow.com/questions/12004808/does-javascript-take-local-decimal-separators-into-account/42213804#42213804

  function getCurrencyParts(formatter: Intl.NumberFormat) {
    // typescript doesn't like this even tough I'm configured for es2020, which means somethign somewhere is configured differently
    const parts = formatter['formatToParts'](11111.1);
    return parts.reduce(
      (s, p) => {
        switch (p.type) {
          case "group":
            s.groupSeparator = p.value;
            return s;
          case "decimal":
            s.decimalSeparator = p.value;
            return s;
          case "currency":
            s.currencySymbol = p.value;
            return s;
        }
        return s;
      },
      {
        groupSeparator: "",
        decimalSeparator: "",
        currencySymbol: "",
      }
    );
  }

  const currencyParts = getCurrencyParts(formatter);

  function parseValue(rawValue: string) {
    const strip = new RegExp(`[\\${currencyParts.groupSeparator}\\${currencyParts.currencySymbol}]`, "gi");
    const decimal = new RegExp(`\\${currencyParts.decimalSeparator}`, "gi");
    const standardizedValue = rawValue.replace(strip, "").replace(decimal, ".");
    const num = parseFloat(standardizedValue);
    const roundFactor = Math.pow(10, decimalScale);
    const roundedNum = Math.round(num * roundFactor) / roundFactor;
    if (Object.is(roundedNum, -0))
      return 0;
    return roundedNum;
  }

  function formatValue(number: number): string {
    return formatter.format(number);
  }

  return {
    locale,
    currency,
    decimalScale,
    currencyParts,
    parseValue,
    formatValue,
    allowedCharacters: new Set<string>([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "-",
      currencyParts.groupSeparator,
      currencyParts.decimalSeparator,
      currencyParts.currencySymbol,
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
      "Enter"
    ])
  };
};
