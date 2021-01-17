import { getCurrencyHelper } from "../currencyHelper";

describe("currencyHelper", () => {
  describe("USD", () => {
    // defaults for now
    const locale = "en-US";
    const currency = "USD";
    const decimalScale = 2;
    const helper = getCurrencyHelper(locale, currency, decimalScale);

    describe("formatValue", () => {
      it("formats a basic value correctly", () => {
        const result = helper.formatValue(1);
        expect(result).toBe("$1.00");
      });

      it("formats a long value correctly", () => {
        const result = helper.formatValue(1000000.23);
        expect(result).toBe("$1,000,000.23");
      });

      it("rounds a too precise decimal", () => {
        const result = helper.formatValue(1.234);
        expect(result).toBe("$1.23");
      });
    });

    describe("parseValue", () => {
      it("parses a plain value correctly", () => {
        const result = helper.parseValue("1.00");
        expect(result).toBe(1);
      });

      it("parses -0 as 0", () => {
        const result = helper.parseValue("-0");
        expect(result).toBe(0);
      });

      it("parses a value with commas correctly", () => {
        const result = helper.parseValue("1,000,000.00");
        expect(result).toBe(1000000);
      });
      it("formats an invalid value with too many commas", () => {
        const result = helper.parseValue("1,,1.00");
        expect(result).toBe(11);
      });
      it("parses a value with $ correctly", () => {
        const result = helper.parseValue("$1.00");
        expect(result).toBe(1);
      });
      it("parses a value with $$ correctly", () => {
        const result = helper.parseValue("$1.00");
        expect(result).toBe(1);
      });
      it("parses a value with $$ and too many commas correctly", () => {
        const result = helper.parseValue("$$1,1,1,1.00");
        expect(result).toBe(1111);
      });
    });
  });
});
