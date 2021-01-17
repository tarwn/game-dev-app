import { getNumberHelper } from "../numberHelper";

describe("numberHelper", () => {
  describe("en-US", () => {
    // defaults for now
    const locale = "en-US";
    const decimalScale = 1;
    const helper = getNumberHelper(locale, decimalScale);

    describe("formatValue", () => {
      it("formats a basic value correctly", () => {
        const result = helper.formatValue(1);
        expect(result).toBe("1.0");
      });

      it("formats a long value correctly", () => {
        const result = helper.formatValue(1234567);
        expect(result).toBe("1,234,567.0");
      });

      it("rounds a too precise decimal", () => {
        const result = helper.formatValue(1.11);
        expect(result).toBe("1.1");
      });

      it("formats a percent w/ not too many digits accurately", () => {
        const result = helper.formatValue(1.1);
        expect(result).toBe("1.1");
      });
    });

    describe("parseValue", () => {
      it("parses a plain value correctly", () => {
        const result = helper.parseValue("100");
        expect(result).toBe(100);
      });

      it("parses -0 as 0", () => {
        const result = helper.parseValue("-0");
        expect(result).toBe(0);
      });
      it("parses a not-too-long decimal correctly", () => {
        const result = helper.parseValue("3.3");
        expect(result).toBe(3.3);
      });
      it("parses a longer decimal correctly and rounds as needed", () => {
        const result = helper.parseValue("3.275111111");
        expect(result).toBe(3.3);
      });
      it("parses a value with commas correctly", () => {
        const result = helper.parseValue("1,000");
        expect(result).toBe(1000);
      });
      it("formats an invalid value with too many commas", () => {
        const result = helper.parseValue("1,,1.00");
        expect(result).toBe(11);
      });
    });
  });
});
