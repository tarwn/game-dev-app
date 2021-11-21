



interface NumberHelper {
  locale: string;
  decimalScale: number;
  parts: {
    groupSeparator: string;
    decimalSeparator: string;
  };
  parseValue: (string) => number;
  formatValue: (number) => string;
  allowedCharacters: Set<string>;
}

export const getNumberHelper = (locale: string, decimalScale: number): NumberHelper => {

  const formatter = new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: decimalScale,
    maximumFractionDigits: decimalScale,
    useGrouping: true
  });

  // https://stackoverflow.com/questions/12004808/does-javascript-take-local-decimal-separators-into-account/42213804#42213804

  function getParts() {
    // local formatter or if you pick 0 decimal places it doesn't parse the decimal to part it out
    const localFormatter = new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    // typescript doesn't like this even tough I'm configured for es2020, which means somethign somewhere is configured differently
    const parts = localFormatter['formatToParts'](11111.1111);
    return parts.reduce(
      (s, p) => {
        switch (p.type) {
          case "group":
            s.groupSeparator = p.value;
            return s;
          case "decimal":
            s.decimalSeparator = p.value;
            return s;
        }
        return s;
      },
      {
        groupSeparator: "",
        decimalSeparator: ""
      }
    );
  }

  const parts = getParts();

  function parseValue(rawValue: string) {
    const strip = new RegExp(`\\${parts.groupSeparator}`, "gi");
    const decimal = new RegExp(`\\${parts.decimalSeparator}`, "gi");
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
      parts.groupSeparator,
      parts.decimalSeparator,
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
