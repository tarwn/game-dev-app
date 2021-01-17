import { getPercentHelper } from "../percentHelper";

describe("percentHelper", () => {
  describe("en-US", () => {
    // defaults for now
    const locale = "en-US";
    const decimalScale = 3;
    const helper = getPercentHelper(locale, decimalScale);

    describe("formatValue", () => {
      it("formats a basic value correctly", () => {
        const result = helper.formatValue(1);
        expect(result).toBe("100%");
      });

      it("formats a long value correctly", () => {
        const result = helper.formatValue(100.12345);
        expect(result).toBe("10,012.345%");
      });

      it("rounds a too precise decimal", () => {
        const result = helper.formatValue(1.234567);
        expect(result).toBe("123.457%");
      });

      it("formats a percent w/ 3 digits accurately", () => {
        const result = helper.formatValue(.03275);
        expect(result).toBe("3.275%");
      });
    });

    describe("parseValue", () => {
      it("parses a plain value correctly", () => {
        const result = helper.parseValue("100");
        expect(result).toBe(1);
      });

      it("parses -0 as 0", () => {
        const result = helper.parseValue("-0");
        expect(result).toBe(0);
      });
      it("parses a longer decimal correctly", () => {
        const result = helper.parseValue("3.275");
        expect(result).toBe(.03275);
      });
      it("parses a longer decimal correctly and rounds as needed", () => {
        const result = helper.parseValue("3.275111111");
        expect(result).toBe(.03275);
      });
      it("parses a value with commas correctly", () => {
        const result = helper.parseValue("1,000");
        expect(result).toBe(10);
      });
      it("formats an invalid value with too many commas", () => {
        const result = helper.parseValue("1,,1.00");
        expect(result).toBe(.11);
      });
      it("parses a value with % correctly", () => {
        const result = helper.parseValue("100%");
        expect(result).toBe(1);
      });
      it("parses a value with %% correctly", () => {
        const result = helper.parseValue("100%%");
        expect(result).toBe(1);
      });
      it("parses a value with %% and too many commas correctly", () => {
        const result = helper.parseValue("1,0,0.0%%");
        expect(result).toBe(1);
      });
    });
  });
});
