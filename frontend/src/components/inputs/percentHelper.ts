



interface PercentHelper {
  locale: string;
  decimalScale: number;
  parts: {
    groupSeperator: string;
    decimalSeperator: string;
    percentSymbol: string;
  };
  parseValue: (string) => number;
  formatValue: (number) => string;
  allowedCharacters: Set<string>;
}

export const getPercentHelper = (locale: string, decimalScale: number): PercentHelper => {

  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });

  // https://stackoverflow.com/questions/12004808/does-javascript-take-local-decimal-separators-into-account/42213804#42213804

  function getParts(formatter: Intl.NumberFormat) {
    // typescript doesn't like this even tough I'm configured for es2020, which means somethign somewhere is configured differently
    const parts = formatter['formatToParts'](11111.1111);
    return parts.reduce(
      (s, p) => {
        switch (p.type) {
          case "group":
            s.groupSeperator = p.value;
            return s;
          case "decimal":
            s.decimalSeparator = p.value;
            return s;
          case "percentSign":
            s.percentSymbol = p.value;
            return s;
        }
        return s;
      },
      {
        groupSeperator: "",
        decimalSeparator: "",
        percentSymbol: "",
      }
    );
  }

  const parts = getParts(formatter);

  function parseValue(rawValue: string) {
    const strip = new RegExp(`[\\${parts.groupSeperator}\\${parts.percentSymbol}]`, "gi");
    const decimal = new RegExp(`\\${parts.decimalSeparator}`, "gi");
    const standardizedValue = rawValue.replace(strip, "").replace(decimal, ".");
    const num = parseFloat(standardizedValue) / 100;
    const roundFactor = Math.pow(10, decimalScale + 2);
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
    decimalScale,
    parts,
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
      parts.groupSeperator,
      parts.decimalSeparator,
      parts.percentSymbol,
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
