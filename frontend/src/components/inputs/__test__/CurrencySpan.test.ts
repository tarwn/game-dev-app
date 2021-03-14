import { render } from "@testing-library/svelte";
import CurrencySpan from "../CurrencySpan.svelte";

describe("CurrencySpan", () => {
  it("displays the full number by default", () => {
    const { container } = render(CurrencySpan, { value: 1_234_567.89 });
    expect(container.innerHTML).toMatch("$1,234,567.89");
  });

  it("displays shortened 'millions' value for round value", () => {
    const { container } = render(CurrencySpan, { value: 1_000_000.0, shorten: true });
    expect(container.innerHTML).toMatch("$1M");
  });

  it("displays shortened 'millions' value for decimal value", () => {
    const { container } = render(CurrencySpan, { value: 1_234_567.89, shorten: true });
    expect(container.innerHTML).toMatch("$1.23M");
  });

  it("displays shortened 'millions' for 990K+", () => {
    const { container } = render(CurrencySpan, { value: 990_000, shorten: true });
    expect(container.innerHTML).toMatch("$0.99M");
  });

  it("displays shortened 'thousands' value rounded for < 990K value", () => {
    const { container } = render(CurrencySpan, { value: 990_000 - 1, shorten: true });
    expect(container.innerHTML).toMatch("$990K");
  });

  it("displays shortened 'thousands' value decimals for < 990K value", () => {
    const { container } = render(CurrencySpan, { value: 9_444, shorten: true });
    expect(container.innerHTML).toMatch("$9.44K");
  });

});
