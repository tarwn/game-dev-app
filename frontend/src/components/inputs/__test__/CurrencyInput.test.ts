import CurrencyInput from "../CurrencyInput.svelte";
import { fireEvent, render } from "@testing-library/svelte";

describe("CurrencyInput", () => {
  it("Renders initial value", () => {
    const { getByRole } = render(CurrencyInput,);

    const currencyInput = getByRole('textbox') as HTMLInputElement;

    expect(currencyInput.value).toBe("0.00");
  });

  it("Parses and formats a raw entered value", async () => {
    const { getByRole } = render(CurrencyInput);

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "1234.56";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(currencyInput.value).toBe("1,234.56");
  });

  it("Parses and formats a raw entered value that has extra characters", async () => {
    const { getByRole } = render(CurrencyInput);

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "$$1,2,3,4.56";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(currencyInput.value).toBe("1,234.56");
  });

  it("Reports invalid error for a value that is below the min and leaves the value set to bad value to be fixed", async () => {
    const { component, getByRole } = render(CurrencyInput, { value: 5, min: 1, max: 10 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "0.5";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(false);
    expect(currencyInput.value).toBe("0.5");
  });

  it("Reports invalid error for a value that is above the max and leaves the value set to bad value to be fixed", async () => {
    const { component, getByRole } = render(CurrencyInput, { value: 5, min: 1, max: 10 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "100";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(false);
    expect(currencyInput.value).toBe("100");
  });

  it("Reports valid validation event error for a value that is between min/max", async () => {
    const { component, getByRole } = render(CurrencyInput, { value: 5, min: 1, max: 10 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "6";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(true);
    expect(currencyInput.value).toBe("6.00");
  });

  it("Reports invalid error and then valid again when it is fixed", async () => {
    const { component, getByRole } = render(CurrencyInput, { value: 5, min: 1, max: 10 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const currencyInput = getByRole('textbox') as HTMLInputElement;
    currencyInput.value = "0";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    currencyInput.value = "4";
    await fireEvent.focusOut(currencyInput);
    await fireEvent.blur(currencyInput);

    expect(validationCounter).toBe(2);
    expect(latestValidState).toBe(true);
    expect(currencyInput.value).toBe("4.00");
  });
});
